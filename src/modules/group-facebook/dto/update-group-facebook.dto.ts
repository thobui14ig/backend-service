import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupFacebookDto } from './create-group-facebook.dto';

export class UpdateGroupFacebookDto extends PartialType(CreateGroupFacebookDto) {}
