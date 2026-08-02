import { PartialType } from '@nestjs/mapped-types';
import { CreateUserTiktokDto } from './create-user-tiktok.dto';

export class UpdateUserTiktokDto extends PartialType(CreateUserTiktokDto) {}
