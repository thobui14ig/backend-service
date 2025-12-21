import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AutoEntity, IAutoSettingParam } from "./auto.entity";

@Injectable()
export class AutoService {
    constructor(
        @InjectRepository(AutoEntity)
        private repo: Repository<AutoEntity>,
    ) { }

    insert(params: IAutoSettingParam) {
        return this.repo.save({
            params
        })
    }

    getAll() {
        return this.repo.find({
            order: {
                id: "DESC"
            }
        })
    }

    remove(id: number) {
        return this.repo.delete({ id })
    }

    update(id: number, params: IAutoSettingParam) {
        return this.repo.save({
            id,
            params
        })
    }
}