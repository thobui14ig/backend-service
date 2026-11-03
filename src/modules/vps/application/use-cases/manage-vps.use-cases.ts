import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VPS_PORT, VpsPort } from '../vps.port';
import { CreateVpsDto } from '../../dto/create-page.dto';
import { VpsEntity, VpsType } from '../../entities/vps.entity';

@Injectable()
export class CreateVpsUseCase {
  constructor(@Inject(VPS_PORT) private readonly vps: VpsPort) {}

  async execute(params: CreateVpsDto) {
    const toCreate: Array<Pick<VpsEntity, 'ip' | 'port' | 'type'>> = [];
    const duplicates: string[] = [];

    for (const entry of params.vps) {
      const match = /^([^:\s]+):(\d{1,5})$/.exec(entry.trim());
      const port = match ? Number(match[2]) : NaN;
      if (!match || port < 1 || port > 65535) {
        throw new BadRequestException(`VPS không hợp lệ: ${entry}`);
      }

      const ip = match[1];
      if (await this.vps.exists(ip, port)) {
        duplicates.push(entry);
      } else {
        toCreate.push({ ip, port, type: params.type ?? VpsType.Post });
      }
    }

    if (toCreate.length > 0) await this.vps.saveMany(toCreate);

    return {
      createdCount: toCreate.length,
      duplicates,
      message: duplicates.length
        ? `Đã thêm ${toCreate.length} VPS; các VPS sau đã tồn tại: ${duplicates.join(', ')}`
        : `Đã thêm ${toCreate.length} VPS`,
    };
  }
}

@Injectable()
export class ListVpsUseCase {
  constructor(@Inject(VPS_PORT) private readonly vps: VpsPort) {}

  execute() {
    return this.vps.findAll();
  }
}

@Injectable()
export class DeleteVpsUseCase {
  constructor(@Inject(VPS_PORT) private readonly vps: VpsPort) {}

  execute(id: number) {
    return this.vps.remove(id);
  }
}

@Injectable()
export class RestartVpsUseCase {
  constructor(@Inject(VPS_PORT) private readonly vps: VpsPort) {}

  async execute(id: number) {
    const instance = await this.vps.findOne(id);
    if (!instance) {
      throw new NotFoundException(`Không tìm thấy VPS với id ${id}`);
    }

    await this.vps.requestRestart(instance.ip, instance.port);
    return {
      id: instance.id,
      ip: instance.ip,
      port: instance.port,
      message: `Đã gửi yêu cầu restart ${instance.ip}:${instance.port}`,
    };
  }
}
