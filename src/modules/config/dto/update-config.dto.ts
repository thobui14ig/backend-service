import { IsBoolean, IsIn } from 'class-validator';

export class UpdateConfigDto {
  @IsIn([0, 1])
  excelId: number;

  @IsIn([0, 1])
  linkId: number;

  @IsBoolean()
  isOrder: boolean;

  @IsBoolean()
  isConvertUid: boolean;
}
