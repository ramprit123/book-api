import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Permission } from './enums/roles.enum';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(name: string, description?: string) {
    return this.prisma.role.create({
      data: { name, description },
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId },
        },
      },
    });
  }

  async createPermission(name: string, description?: string) {
    return this.prisma.permission.create({
      data: { name, description },
    });
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: { id: permissionId },
        },
      },
    });
  }

  async getUserRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
    return user?.roles || [];
  }

  async initializeRolesAndPermissions() {
    // Create default roles
    const adminRole = await this.createRole(Role.ADMIN, 'Administrator with full access');
    const userRole = await this.createRole(Role.USER, 'Regular user with limited access');

    // Create permissions
    const permissions = await Promise.all(
      Object.values(Permission).map(async (permName) => {
        return this.createPermission(permName);
      })
    );

    // Assign permissions to admin role
    await Promise.all(
      permissions.map((permission) =>
        this.assignPermissionToRole(adminRole.id, permission.id)
      )
    );

    // Assign basic permissions to user role
    const userPermissions = permissions.filter((p) => p.name === Permission.READ_BOOK);
    await Promise.all(
      userPermissions.map((permission) =>
        this.assignPermissionToRole(userRole.id, permission.id)
      )
    );

    return { adminRole, userRole, permissions };
  }
}