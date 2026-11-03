import { VpsEntity } from '../entities/vps.entity';

export const VPS_PORT = Symbol('VPS_PORT');

export interface VpsPort {
  exists(ip: string, port: number): Promise<boolean>;
  saveMany(vps: Array<Pick<VpsEntity, 'ip' | 'port' | 'type'>>): Promise<unknown>;
  findAll(): Promise<VpsEntity[]>;
  findOne(id: number): Promise<VpsEntity | null>;
  remove(id: number): Promise<unknown>;
  requestRestart(ip: string, port: number): Promise<void>;
}
