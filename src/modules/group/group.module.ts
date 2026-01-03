import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { GroupFacebookController } from './group.controller';
import { GroupService } from './group.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity])],
  exports: [GroupService],
  controllers: [GroupFacebookController],
  providers: [GroupService],
})
export class GroupModule { }
