import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupFacebookEntity } from './entities/group-facebook.entity';
import { GroupFacebookController } from './group-facebook.controller';
import { GroupFacebooService } from './group-facebook.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupFacebookEntity])],
  exports: [GroupFacebooService],
  controllers: [GroupFacebookController],
  providers: [GroupFacebooService],
})
export class GroupFacebookModule { }
