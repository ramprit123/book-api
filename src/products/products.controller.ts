import { Auth } from '@app/auth/decorators/roles.decorator';
import { Permission, Role } from '@app/auth/enums/roles.enum';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Products')
@Controller('products')
@Auth({ roles: [Role.ADMIN] })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @Auth({ permissions: [Permission.CREATE_PRODUCT] })
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: CreateProductDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateProductDto })
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(createProductDto, user.id);
  }

  @Post('bulk')
  @Auth({ permissions: [Permission.CREATE_PRODUCT] })
  @ApiOperation({ summary: 'Create multiple products' })
  @ApiResponse({ status: 201, description: 'Products created successfully', type: [CreateProductDto] })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: [CreateProductDto] })
  createMany(@Body() createProductDto: CreateProductDto[], @CurrentUser() user: any) {
    return this.productsService.createMany(createProductDto, user.id);
  }

  @Get()
  @Auth({ roles: [Role.USER, Role.ADMIN], permissions: [Permission.READ_PRODUCT] })
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({ status: 200, description: 'Return all products' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.productsService.findAll({ page: +page, limit: +limit });
  }

  @Get(':id')
  @Auth({ roles: [Role.USER, Role.ADMIN], permissions: [Permission.READ_PRODUCT] })
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({ status: 200, description: 'Return product by id', type: CreateProductDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Auth({ permissions: [Permission.UPDATE_PRODUCT] })
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully', type: CreateProductDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: CreateProductDto })
  update(@Param('id') id: string, @Body() updateProductDto: CreateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth({ permissions: [Permission.DELETE_PRODUCT] })
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}