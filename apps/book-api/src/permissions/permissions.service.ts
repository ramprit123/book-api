import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: createPermissionDto
    });
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.permission.count(),
      this.prisma.permission.findMany({
        skip,
        take: limit,
        include: { roles: true }
      })
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
      include: { roles: true }
    });
  }

  async update(id: string, updatePermissionDto: CreatePermissionDto) {
    return this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto
    });
  }

  async remove(id: string) {
    return this.prisma.permission.delete({ where: { id } });
  }
}