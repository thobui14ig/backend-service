import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  phone: string;

  @IsNumber()
  @IsOptional()
  level?: number;

  @IsNotEmpty()
  @IsString()
  password: string;
}
