import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Role, Permission } from '../enums/roles.enum';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
export const Permissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

// Type for the Auth decorator parameters
interface AuthOptions {
  roles?: Role[];
  permissions?: Permission[];
}

// Combined decorator for both roles and permissions
export function Auth(options: AuthOptions): MethodDecorator & ClassDecorator;
export function Auth(roles?: Role[], permissions?: Permission[]): MethodDecorator & ClassDecorator;
export function Auth(
  rolesOrOptions?: Role[] | AuthOptions,
  permissionsArr?: Permission[]
): MethodDecorator & ClassDecorator {
  let roles: Role[] = [];
  let permissions: Permission[] = [];

  if (Array.isArray(rolesOrOptions)) {
    roles = rolesOrOptions;
    permissions = permissionsArr || [];
  } else if (rolesOrOptions) {
    roles = rolesOrOptions.roles || [];
    permissions = rolesOrOptions.permissions || [];
  }

  const decorators = [
    ...(roles.length > 0 ? [SetMetadata(ROLES_KEY, roles)] : []),
    ...(permissions.length > 0 ? [SetMetadata(PERMISSIONS_KEY, permissions)] : [])
  ];
  return applyDecorators(...decorators);
}