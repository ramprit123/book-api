import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        permissions: createRoleDto.permissions ? {
          connect: createRoleDto.permissions.map(id => ({ id }))
        } : undefined
      }
    });
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.role.count(),
      this.prisma.role.findMany({
        skip,
        take: limit,
        include: { permissions: true }
      })
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true }
    });
  }

  async update(id: string, updateRoleDto: CreateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
        permissions: updateRoleDto.permissions ? {
          set: updateRoleDto.permissions.map(id => ({ id }))
        } : undefined
      }
    });
  }

  async remove(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}