import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { firstValueFrom } from "rxjs";
import { Repository } from "typeorm";
import { VpsEntity, VpsStatus } from "./entities/vps.entity";
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
        const vpsValid = [];
        const vpsInValid = [];

        for (let vps of params.vps) {
            const vpsSplit = vps.split(":")
            const isExit = (await this.repo.findOne({
                where: {
                    ip: vpsSplit[0],
                    port: Number(vpsSplit[1]),
                },
            }))
                ? true
                : false;

            if (!isExit) {
                vpsValid.push({
                    ip: vpsSplit[0],
                    port: Number(vpsSplit[1]),
                });
                continue;
            }

            vpsInValid.push(vps);
        }

        await this.repo.save(vpsValid);

        if (vpsInValid.length > 0) {
            throw new HttpException(
                `Thêm thành công ${vpsValid.length}, page bị trùng: [${vpsInValid.join(',')}]`,
                HttpStatus.BAD_REQUEST,
            );
        }
        throw new HttpException(
            `Thêm thành công ${vpsValid.length} page`,
            HttpStatus.OK,
        );
    }


    async getAll() {
        return await this.repo.find({
            order: {
                id: "ASC"
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