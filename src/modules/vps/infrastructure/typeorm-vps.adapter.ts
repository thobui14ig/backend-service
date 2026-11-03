import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { VpsPort } from '../application/vps.port';
import { VpsEntity } from '../entities/vps.entity';

@Injectable()
export class TypeOrmVpsAdapter implements VpsPort {
  constructor(
    @InjectRepository(VpsEntity)
    private readonly repository: Repository<VpsEntity>,
    private readonly http: HttpService,
  ) {}

  async exists(ip: string, port: number) {
    return Boolean(await this.repository.findOne({ where: { ip, port } }));
  }

  saveMany(vps: Array<Pick<VpsEntity, 'ip' | 'port' | 'type'>>) {
    return this.repository.save(vps);
  }

  findAll() {
    return this.repository.find({ order: { ip: 'ASC', port: 'DESC' } });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } });
  }

  remove(id: number) {
    return this.repository.delete({ id });
  }

  async requestRestart(ip: string, port: number) {
    await firstValueFrom(
      this.http.post(`http://${ip}:${port}/restart`, {}, { timeout: 5000 }),
    );
  }
}
