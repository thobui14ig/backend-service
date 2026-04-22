import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto {
    @IsNumber()
    id: number

    @IsBoolean()
    isGetPhone: boolean

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsNumber()
  @IsOptional()
  @IsOptional()
  level?: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  password: string;
 }