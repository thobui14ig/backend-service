import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { LinkEntity } from './entities/links.entity';
import { LinkController } from './links.controller';
import { LinkService } from './links.service';

@Module({
  imports: [TypeOrmModule.forFeature([LinkEntity]), forwardRef(() => UserModule)],
  controllers: [LinkController],
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule { }
