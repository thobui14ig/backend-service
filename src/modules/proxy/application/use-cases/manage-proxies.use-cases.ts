import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PROXY_PORT, ProxyPort } from '../proxy.port';
import { CreateProxyDto } from '../../dto/create-proxy.dto';
import { UpdateProxyDto } from '../../dto/update-proxy.dto';
import { IGetProxy } from '../../proxy.controller.i';
import { ProxyEntity } from '../../entities/proxy.entity';

@Injectable()
export class CreateProxiesUseCase {
  constructor(@Inject(PROXY_PORT) private readonly proxies: ProxyPort) {}

  async execute(params: CreateProxyDto) {
    const valid: Array<Partial<ProxyEntity>> = [];
    const duplicates: string[] = [];

    for (let address of params.proxies) {
      if (address.includes('@')) {
        const [credentials, host] = address.split('@');
        address = `${host}:${credentials}`;
      }

      if (await this.proxies.exists(address)) {
        duplicates.push(address);
      } else {
        valid.push({ proxyAddress: address, type: params.type });
      }
    }

    await this.proxies.saveMany(valid);
    if (duplicates.length > 0) {
      throw new HttpException(
        `Thêm thành công ${valid.length}, Proxy bị trùng: [${duplicates.join(',')}]`,
        HttpStatus.BAD_REQUEST,
      );
    }
    throw new HttpException(
      `Thêm thành công ${valid.length} proxy`,
      HttpStatus.OK,
    );
  }
}

@Injectable()
export class ListProxiesUseCase {
  constructor(@Inject(PROXY_PORT) private readonly proxies: ProxyPort) {}

  execute(filters: IGetProxy) {
    return this.proxies.findAll(filters);
  }
}

@Injectable()
export class GetProxyUseCase {
  constructor(@Inject(PROXY_PORT) private readonly proxies: ProxyPort) {}

  execute(id: number) {
    return this.proxies.findOne(id);
  }
}

@Injectable()
export class UpdateProxyUseCase {
  execute(id: number, _input: UpdateProxyDto) {
    return `This action updates a #${id} proxy`;
  }
}

@Injectable()
export class DeleteProxyUseCase {
  constructor(@Inject(PROXY_PORT) private readonly proxies: ProxyPort) {}

  execute(id: number) {
    return this.proxies.remove(id);
  }
}

@Injectable()
export class DeleteProxiesUseCase {
  constructor(@Inject(PROXY_PORT) private readonly proxies: ProxyPort) {}

  execute(ids: number[]) {
    return this.proxies.removeMany(ids);
  }
}
