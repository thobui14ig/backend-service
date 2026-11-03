import { LinkStatus, LinkType } from '../../links/entities/links.entity';
import { VpsEntity, VpsStatus } from '../../vps/entities/vps.entity';
import { ProcessDTO } from '../dto/process.dto';

export const MONITORING_PORT = Symbol('MONITORING_PORT');

export interface MonitoringPort {
  getLinkType(linkId: number): Promise<LinkType | null>;
  updateLinkProcess(input: ProcessDTO, delayTime: number, createdAt: Date): Promise<void>;
  findVpsInstances(): Promise<VpsEntity[]>;
  checkVps(ip: string, port: number): Promise<{ status: boolean; speed: number }>;
  updateVpsStatus(
    id: number,
    status: VpsStatus,
    speed: number,
  ): Promise<void>;
}
