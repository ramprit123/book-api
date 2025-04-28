import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'create:user', description: 'Name of the permission' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Permission to create users', description: 'Permission description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}