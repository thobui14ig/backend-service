import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../monitoring.service.i';
import { VpsStatus } from '../../../vps/entities/vps.entity';
import { MONITORING_PORT, MonitoringPort } from '../monitoring.port';

@Injectable()
export class CheckVpsStatusUseCase {
  constructor(
    @Inject(MONITORING_PORT)
    private readonly monitoring: MonitoringPort,
  ) {}

  async execute(environment: string): Promise<void> {
    if (environment === ENV.DEVELOPMENT) return;

    const instances = await this.monitoring.findVpsInstances();
    for (const instance of instances) {
      let status = VpsStatus.Live;
      let speed = 0;
      try {
        const health = await this.monitoring.checkVps(
          instance.ip,
          instance.port,
        );
        status = health.status ? VpsStatus.Live : VpsStatus.Die;
        speed = health.speed;
      } catch {
        status = VpsStatus.Die;
      }

      await this.monitoring.updateVpsStatus(instance.id, status, speed);
    }
  }
}
