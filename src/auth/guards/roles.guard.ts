import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, Permission, RolePermissions } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    const requiredPermissions = this.reflector.get<Permission[]>('permissions', context.getHandler());

    if (!requiredRoles && !requiredPermissions) {
      return true; // No roles or permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    // Check roles
    if (requiredRoles) {
      const hasRole = user.roles.some((role: Role) => requiredRoles.includes(role));
      if (!hasRole) return false;
    }

    // Check permissions
    if (requiredPermissions) {
      const userPermissions = user.roles.reduce((permissions: Permission[], role: Role) => {
        return [...permissions, ...(RolePermissions[role] || [])];
      }, []);

      const hasPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermissions) return false;
    }

    return true;
  }
}