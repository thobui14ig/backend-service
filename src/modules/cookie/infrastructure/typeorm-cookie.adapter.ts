import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CookiePort, CookieRecord } from "../application/cookie.port";
import {
  CreateCookieInput,
  UpdateCookieInput,
} from "../application/cookie.types";
import { CookieEntity, CookieStatus } from "../entities/cookie.entity";

@Injectable()
export class TypeOrmCookieAdapter implements CookiePort {
  constructor(
    @InjectRepository(CookieEntity)
    private readonly repository: Repository<CookieEntity>,
  ) {}

  async create(input: CreateCookieInput): Promise<void> {
    const records = input.cookies.map((cookie) => ({
      cookie,
      status: CookieStatus.ACTIVE,
      createdBy: input.createdBy,
      pageId: input.pageId,
    }));

    await this.repository.save(records);
  }

  findAllForUser(userId: number): Promise<CookieRecord[]> {
    return this.repository.find({
      where: { createdBy: userId },
      order: { id: "DESC" },
    }) as Promise<CookieRecord[]>;
  }

  findAll(): Promise<CookieRecord[]> {
    return this.repository
      .createQueryBuilder("c")
      .leftJoin("c.user", "user")
      .orderBy("c.id", "DESC")
      .getMany() as Promise<CookieRecord[]>;
  }

  findOne(id: number): Promise<CookieRecord | null> {
    return this.repository.findOne({
      where: { id },
    }) as Promise<CookieRecord | null>;
  }

  update(id: number, input: UpdateCookieInput): Promise<CookieRecord> {
    const update: Partial<CookieEntity> = {
      id,
      status: input.status,
    };
    return this.repository.save(update);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}
