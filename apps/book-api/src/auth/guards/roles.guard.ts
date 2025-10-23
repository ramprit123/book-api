import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, Permission, RolePermissions } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );
    const requiredPermissions = this.reflector.get<Permission[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredRoles && !requiredPermissions) {
      return true; // No roles or permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'Authentication required. Please provide a valid token.',
      );
    }

    if (!user.roles || user.roles.length === 0) {
      throw new ForbiddenException('Access denied. No roles assigned to user.');
    }

    // Extract role names from user.roles objects
    const userRoleNames = user.roles.map((role: any) => role.name as Role);

    // Check roles
    if (requiredRoles) {
      const hasRole = userRoleNames.some((roleName: Role) =>
        requiredRoles.includes(roleName),
      );
      if (!hasRole) {
        throw new ForbiddenException(
          `Access denied. Required roles: ${requiredRoles.join(', ')}. Your roles: ${userRoleNames.join(', ')}`,
        );
      }
    }

    // Check permissions
    if (requiredPermissions) {
      const userPermissions = userRoleNames.reduce(
        (permissions: Permission[], roleName: Role) => {
          return [...permissions, ...(RolePermissions[roleName] || [])];
        },
        [],
      );

      const missingPermissions = requiredPermissions.filter(
        (permission) => !userPermissions.includes(permission),
      );

      if (missingPermissions.length > 0) {
        throw new ForbiddenException(
          `Access denied. Missing permissions: ${missingPermissions.join(', ')}. Your permissions: ${userPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
