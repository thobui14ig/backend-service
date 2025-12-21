import { Module } from "@nestjs/common";
import { AutoService } from "./auto.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AutoEntity } from "./auto.entity";
import { PageController } from "./auto.controller";

@Module({
  imports: [TypeOrmModule.forFeature([AutoEntity])],
  controllers: [PageController],
  providers: [AutoService],
  exports: [AutoService]
})
export class AutoModule { }