import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VISITOR = 'VISITOR',
}

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles); 