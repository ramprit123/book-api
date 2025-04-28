import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';



@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

async createMany(products: CreateProductDto[], userId: string) {
  const createdProducts = await Promise.all(
    products.map(product => 
      this.prisma.product.create({
        data: {
          ...product,
          createdBy: {
            connect: {
              id: userId
            }
          }
        },
      })
    )
  );

  return {
    count: createdProducts.length,
    products: createdProducts
  };
}

  
  async create(createProductDto: CreateProductDto, userId: string) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        createdBy: {
          connect: {
            id: userId
          }
        }
      },
    });
  }

  async findAll({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
      }),
      this.prisma.product.count(),
    ]);

    return {
      products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}