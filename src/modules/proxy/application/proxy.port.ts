import { IGetProxy } from '../proxy.controller.i';
import { ProxyEntity } from '../entities/proxy.entity';

export const PROXY_PORT = Symbol('PROXY_PORT');

export interface ProxyPort {
  exists(address: string): Promise<boolean>;
  saveMany(proxies: Array<Partial<ProxyEntity>>): Promise<unknown>;
  findAll(filters: IGetProxy): Promise<ProxyEntity[]>;
  findOne(id: number): Promise<ProxyEntity | null>;
  remove(id: number): Promise<unknown>;
  removeMany(ids: number[]): Promise<unknown>;
}
