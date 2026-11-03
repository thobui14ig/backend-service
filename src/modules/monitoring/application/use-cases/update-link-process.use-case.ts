import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { LinkStatus } from '../../../links/entities/links.entity';
import { MONITORING_PORT, MonitoringPort } from '../monitoring.port';
import { ProcessDTO } from '../../dto/process.dto';

dayjs.extend(utc);

@Injectable()
export class UpdateLinkProcessUseCase {
  constructor(
    @Inject(MONITORING_PORT)
    private readonly monitoring: MonitoringPort,
  ) {}

  async execute(input: ProcessDTO) {
    const type = await this.monitoring.getLinkType(input.id);
    const delayTime = await this.getDelayTime(input.status, type);
    await this.monitoring.updateLinkProcess(
      input,
      delayTime,
      dayjs.utc().toDate(),
    );

    throw new HttpException(
      `${input.status === LinkStatus.Started ? 'Start' : 'Stop'} monitoring for link_id ${input.id}`,
      HttpStatus.OK,
    );
  }

  private async getDelayTime(
    _status: LinkStatus,
    _type: string | null,
  ): Promise<number> {
    return 10;
  }
}
