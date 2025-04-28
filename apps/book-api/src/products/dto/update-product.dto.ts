import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UpdateProductDto {
    @ApiProperty({
      description: 'The name of the product',
      example: 'iPhone 12',
      required: false,
    })
    @IsString()
    name?: string;
  
    @ApiProperty({
      description: 'The description of the product',
      example: 'Latest iPhone model with A14 Bionic chip',
      required: false,
    })
    @IsString()
    description?: string;
  
    @ApiProperty({
      description: 'The price of the product',
      example: 999.99,
      minimum: 0,
      required: false,
    })
    @IsNumber()
    @Min(0)
    price?: number;
  
    @ApiProperty({
      description: 'The available stock quantity',
      example: 100,
      minimum: 0,
      required: false,
    })
    @IsNumber()
    @Min(0)
    stock?: number;
  }