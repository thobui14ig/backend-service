import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, IsDateString, IsIn, Matches } from 'class-validator';

export interface DashboardStats {
  link: LinkStats;
  comment: CommentStats;
  proxy?: ProxyStats;
  token?: TokenStats;
  transaction?: TransactionStats;
  vps?: Record<string, VpsTypeStats>;
}

export interface LinkStats {
  die: number;
  live: number;
  undefined: number;
  livePost: number;
  liveLiveStream: number;
  users?: DashboardUserStats[];
}

export interface DashboardUserStats {
  id: number;
  name: string;
  totalLink: number;
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
  pendingPhoneCommentCount: number;
}

export interface TransactionStats {
  totalIncome: number | null;
  totalExpense: number | null;
  currentMonthIncome: number | null;
  currentMonthExpense: number | null;
}

export interface VpsTypeStats {
  averageSpeed: number;
  fastest: { ip: string; speed: number } | null;
  slowest: { ip: string; speed: number } | null;
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
  full_name: string;

  @IsString()
  @Matches(/^(0[3|5|7|8|9])+([0-9]{8})\b$/, { 
    message: 'Số điện thoại không hợp lệ (VD: 0987654321)' 
  })
  phone: string;


  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ là bắt buộc' })
  address: string;
}
