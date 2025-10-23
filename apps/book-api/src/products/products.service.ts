import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createMany(products: CreateProductDto[], userId: string) {
    try {
      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      const createdProducts = await Promise.all(
        products.map((product) =>
          this.prisma.product.create({
            data: {
              ...product,
              createdBy: {
                connect: {
                  id: userId,
                },
              },
            },
          }),
        ),
      );

      return {
        count: createdProducts.length,
        products: createdProducts,
        message: `Successfully created ${createdProducts.length} products`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'One or more products already exist with the same unique identifier',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid user reference provided');
        }
      }

      throw new InternalServerErrorException(
        'Failed to create products. Please try again later.',
      );
    }
  }

  async create(createProductDto: CreateProductDto, userId: string) {
    try {
      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
          createdBy: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return {
        ...product,
        message: 'Product created successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A product with this name already exists',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid user reference provided');
        }
      }

      throw new InternalServerErrorException(
        'Failed to create product. Please try again later.',
      );
    }
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
    if (!id || id.trim() === '') {
      throw new BadRequestException(
        'Product ID is required and cannot be empty',
      );
    }

    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }

      return product;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve product. Please try again later.',
      );
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (!id || id.trim() === '') {
      throw new BadRequestException(
        'Product ID is required and cannot be empty',
      );
    }

    if (!updateProductDto || Object.keys(updateProductDto).length === 0) {
      throw new BadRequestException(
        'Update data is required and cannot be empty',
      );
    }

    try {
      // Check if product exists
      await this.findOne(id);

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return {
        ...updatedProduct,
        message: 'Product updated successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A product with this name already exists',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product with ID '${id}' not found`);
        }
      }

      throw new InternalServerErrorException(
        'Failed to update product. Please try again later.',
      );
    }
  }

  async remove(id: string) {
    if (!id || id.trim() === '') {
      throw new BadRequestException(
        'Product ID is required and cannot be empty',
      );
    }

    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);

      await this.prisma.product.delete({
        where: { id },
      });

      return {
        message: `Product '${existingProduct.name}' deleted successfully`,
        deletedProduct: {
          id: existingProduct.id,
          name: existingProduct.name,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product with ID '${id}' not found`);
        }
      }

      throw new InternalServerErrorException(
        'Failed to delete product. Please try again later.',
      );
    }
  }
}
