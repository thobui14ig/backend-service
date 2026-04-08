import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, IsDateString, IsIn, Matches } from 'class-validator';

export interface DashboardStats {
  link: LinkStats;
  proxy: ProxyStats;
  token: TokenStats;
  comment: CommentStats;
}

export interface LinkStats {
  die: number;
  live: number;
  undefined: number;
}

export interface ProxyStats {
  active: number;
  inactive: number;
}

export interface TokenStats {
  active: number;
  limit: number;
  die: number;
}

export interface CommentStats {
  today: number;
  total: number;
}



export enum RequestType {
  BIRTHDAY = 'birthday',
  LIVESTREAM = 'livestream'
}

export enum LivestreamTime {
  T20_00 = '20:00',
  T20_15 = '20:15',
  T20_30 = '20:30',
  T20_45 = '20:45',
  T21_00 = '21:00',
  T21_15 = '21:15',
  T21_30 = '21:30',
  T21_45 = '21:45',
  T22_00 = '22:00'
}

export class RequestSong {
  @IsString()
  @IsNotEmpty({ message: 'Tên là bắt buộc' })
  name: string;

  @IsString()
  @Matches(/^(0[3|5|7|8|9])+([0-9]{8})\b$/, { 
    message: 'Số điện thoại không hợp lệ (VD: 0987654321)' 
  })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên bài hát là bắt buộc' })
  song: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung yêu cầu là bắt buộc' })
  content: string;

  @IsEnum(RequestType, { message: 'Type phải là birthday hoặc livestream' })
  type: RequestType;

  @IsOptional()
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0, { message: 'Số tiền >= 0' })
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Ngày sinh nhật không hợp lệ (YYYY-MM-DD)' })
  birthdayDate?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Ngày livestream không hợp lệ (YYYY-MM-DD)' })
  livestreamDate?: string;

  @IsOptional()
  @IsEnum(LivestreamTime, { message: 'Giờ phải là 20:00, 20:15, ... 22:00' })
  livestreamTime?: LivestreamTime;
}
