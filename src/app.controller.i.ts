import { IsString } from "class-validator";

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

export class UserSupportDto {
  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsString()
  amount: number;
}
