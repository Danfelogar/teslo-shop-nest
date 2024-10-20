// creado con 'nest g gu auth/guards/userRole --no-spec'
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators';
import { User } from 'src/auth/entities';

@Injectable()
export class UserRoleGuard implements CanActivate {
  //obtener la data mirar doc para ver para que mas sirve reflector
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //esta info se saca de la doc de los custom Guards y reflector
    //se obtiene los roles que se pasan en el decorador
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );
    //si no hay roles validos se retorna true porque puede entrar cualquiera "no aconsejable"
    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) throw new BadRequestException('User not found');
    //se recorre los roles del usuario y se compara con los roles validos en caso afirmativo se retorna true
    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRoles}]`,
    );
  }
}
