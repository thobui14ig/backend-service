import { PartialType } from '@nestjs/mapped-types';
import { CreateCookieDto } from './create-cookie.dto';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { CookieStatus } from '../domain/cookie-status.enum';

export class UpdateCookieDto extends PartialType(CreateCookieDto) {
    @IsString({ message: "Cookie phải là string" })
    cookies: string[]

    @IsEnum(CookieStatus)
    status: CookieStatus;
}
