import { HttpService } from "@nestjs/axios";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { firstValueFrom } from "rxjs";
import { Repository } from "typeorm";
import { VpsEntity, VpsType } from "./entities/vps.entity";
import { CreateVpsDto } from "./dto/create-page.dto";
import { AppGateway } from "src/infra/socket/app.gateway";

@Injectable()
export class VpsService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(VpsEntity)
        private repo: Repository<VpsEntity>,
        private socketServer: AppGateway
    ) { }

    async create(params: CreateVpsDto, userId: number) {
        const vpsToCreate: Array<Pick<VpsEntity, 'ip' | 'port' | 'type'>> = [];
        const duplicates: string[] = [];

        for (const entry of params.vps) {
            const match = /^([^:\s]+):(\d{1,5})$/.exec(entry.trim());
            const port = match ? Number(match[2]) : NaN;
            if (!match || port < 1 || port > 65535) {
                throw new BadRequestException(`VPS không hợp lệ: ${entry}`);
            }

            const ip = match[1];
            const exists = await this.repo.findOne({ where: { ip, port } });
            if (exists) {
                duplicates.push(entry);
                continue;
            }

            vpsToCreate.push({ ip, port, type: params.type ?? VpsType.Post });
        }

        if (vpsToCreate.length > 0) {
            await this.repo.save(vpsToCreate);
        }

        return {
            createdCount: vpsToCreate.length,
            duplicates,
            message: duplicates.length
                ? `Đã thêm ${vpsToCreate.length} VPS; các VPS sau đã tồn tại: ${duplicates.join(', ')}`
                : `Đã thêm ${vpsToCreate.length} VPS`
        };
    }


    async getAll() {
        return await this.repo.find({
            order: {
                ip: 'ASC',
                port: 'DESC'
            }
        })
    }

    remove(id: number) {
        return this.repo.delete({ id })
    }


    restartServer(ports: string[]) {
        return this.socketServer.restartServer(ports)
    }
}