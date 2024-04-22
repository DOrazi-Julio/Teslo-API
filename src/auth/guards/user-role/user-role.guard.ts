import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, // Esto es para ver la metadata
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );
    

    if (!validRoles) return true // Si no se establecen roles en la metadata de la ruta , entonces se interpreta que la ruta no tiene protección de roles
    if (validRoles.length === 0) return true // De la misma forma que el if anterior , si se especifica roles como array vacío se interpreta que la ruta no tiene gestión de roles



    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) throw new BadRequestException(`User not found`);

    for (const role of user.role) {
      if (validRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role [${validRoles}]`,
    );
  }
}
