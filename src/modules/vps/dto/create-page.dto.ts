import { IsArray, IsEnum, IsString } from "class-validator";
import { VpsType } from "../entities/vps.entity";

export class CreateVpsDto {
  @IsArray({ message: 'Danh sách VPS phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi VPS phải có dạng IP:PORT' })
  vps: string[];

  @IsEnum(VpsType, { message: 'Loại VPS không hợp lệ' })
  type: VpsType;
}
