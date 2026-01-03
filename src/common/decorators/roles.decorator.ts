import { SetMetadata } from '@nestjs/common';

export enum Role {
  ADMIN = 1,
  USER = 0,
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) =>
  SetMetadata(ROLES_KEY, roles);
