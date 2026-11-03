import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { LinkEntity } from '../../links/entities/links.entity';
import { VpsEntity, VpsStatus } from '../../vps/entities/vps.entity';
import { MonitoringPort } from '../application/monitoring.port';
import { ProcessDTO } from '../dto/process.dto';

@Injectable()
export class TypeOrmMonitoringAdapter implements MonitoringPort {
  constructor(
    @InjectRepository(LinkEntity)
    private readonly links: Repository<LinkEntity>,
    @InjectRepository(VpsEntity)
    private readonly vps: Repository<VpsEntity>,
    private readonly http: HttpService,
  ) {}

  async getLinkType(linkId: number) {
    const link = await this.links.findOne({
      where: { id: linkId },
      select: { id: true, type: true },
    });
    return link?.type ?? null;
  }

  async updateLinkProcess(
    input: ProcessDTO,
    delayTime: number,
    createdAt: Date,
  ) {
    const update: Partial<LinkEntity> = {
      id: input.id,
      status: input.status,
      delayTime,
      createdAt,
    };
    await this.links.save(update);
  }

  findVpsInstances() {
    return this.vps.find();
  }

  async checkVps(ip: string, port: number) {
    const response = await firstValueFrom(
      this.http.get(`http://${ip}:${port}/health-check`),
    );
    return response.data as { status: boolean; speed: number };
  }

  async updateVpsStatus(id: number, status: VpsStatus, speed: number) {
    await this.vps.update(id, { status, speed: String(speed) });
  }
}
