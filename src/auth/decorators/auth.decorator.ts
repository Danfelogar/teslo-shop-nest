import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    //roleProtected es el decorador que da el array de roles validos
    RoleProtected(...roles),
    //UserRoleGuard es el guard que se encarga de verificar si el usuario tiene los roles validos
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
