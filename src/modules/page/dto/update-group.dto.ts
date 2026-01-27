import { PartialType } from '@nestjs/mapped-types';
import { CreatePageDto } from './create-group.dto';

export class UpdatePageDto extends PartialType(CreatePageDto) {}
