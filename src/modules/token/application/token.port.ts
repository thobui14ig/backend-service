import { TokenEntity } from '../entities/token.entity';

export const TOKEN_PORT = Symbol('TOKEN_PORT');

export interface TokenPort {
  exists(tokenValue: string): Promise<boolean>;
  saveMany(tokens: Array<Partial<TokenEntity>>): Promise<unknown>;
  findAll(): Promise<TokenEntity[]>;
  findOne(id: number): Promise<TokenEntity | null>;
  remove(id: number): Promise<unknown>;
}
