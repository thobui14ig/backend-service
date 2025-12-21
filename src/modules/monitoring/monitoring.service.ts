import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { Repository } from 'typeorm';
import {
  LinkEntity,
  LinkStatus,
  LinkType
} from '../links/entities/links.entity';
import { LEVEL } from '../user/entities/user.entity';
import { ProcessDTO } from './dto/process.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LinkService } from '../links/links.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { VpsEntity, VpsStatus } from '../vps/entities/vps.entity';
import { ConfigService } from '@nestjs/config';
import { ENV } from './monitoring.service.i';

dayjs.extend(utc);

@Injectable()
export class MonitoringService {
  env: string = ENV.DEVELOPMENT

  constructor(
    @InjectRepository(LinkEntity)
    private linkRepository: Repository<LinkEntity>,
    private httpService: HttpService,
    @InjectRepository(VpsEntity)
    private vpsRepository: Repository<VpsEntity>,
    private configService: ConfigService
  ) {
    this.env = this.configService.get<string>('ENV');
  }


  async updateProcess(processDTO: ProcessDTO, level: LEVEL, userId: number) {
    const link = await this.linkRepository.findOne({
      where: {
        id: processDTO.id
      },
      relations: {
        user: true
      }
    });
    const delayTime = await this.getDelayTime(processDTO.status, link.type)
    const dataUpdate = { ...processDTO, delayTime }
    const response = await this.linkRepository.save({ ...dataUpdate, createdAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss') as any });

    throw new HttpException(
      `${response.status === LinkStatus.Started ? 'Start' : 'Stop'} monitoring for link_id ${processDTO.id}`,
      HttpStatus.OK,
    );
  }

  async getDelayTime(status: LinkStatus, type: LinkType) {
    return 10
  }

  // @Cron(CronExpression.EVERY_10_SECONDS)
  async checkStatusService() {
    if (this.env == ENV.DEVELOPMENT) return;

    const vpss = await this.vpsRepository.find()

    for (const vps of vpss as any) {
      try {
        try {
          const response = await firstValueFrom(this.httpService.get(`http://${vps.ip}:${vps.port}/health-check`))
          const { status, speed } = response.data
          vps.status = status ? VpsStatus.Live : VpsStatus.Die
          vps.speed = speed
        } catch (e) {
          vps.status = VpsStatus.Die
          vps.speed = 0
        }

        await this.vpsRepository.update(vps.id, { status: vps.status, speed: vps.speed })
      } catch (error) { }
    }
  }

}
