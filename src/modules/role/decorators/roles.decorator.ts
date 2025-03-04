import { SetMetadata } from '@nestjs/common';
import { RoleCode } from '../entities/role.entity';

export const Roles = (...roles: RoleCode[]) => SetMetadata('roles', roles); 