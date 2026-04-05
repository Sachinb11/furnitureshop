import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsUUID,
  IsPositive,
  Min,
  MaxLength,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Nested DTO for images ────────────────────────────────────────────────────
export class ProductImageDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// ── Main create DTO ──────────────────────────────────────────────────────────
export class CreateProductDto {
  @ApiProperty({ description: 'UUID of the category' })
  @IsString()
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  categoryId: string;

  @ApiProperty({ example: 'KLIPPAN Sofa' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'klippan-sofa' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 14999 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  // Transform: frontend sends string from <input type="number">, convert to number
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  basePrice: number;

  @ApiPropertyOptional({ example: 12999 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  salePrice?: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : 0))
  stockQuantity: number;

  @ApiPropertyOptional({ example: 'KLP-GRY-2S' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  specs?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true)  return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true)  return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  weightKg?: number;

  @ApiPropertyOptional({ type: [ProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}

// ── Update DTO (all fields optional) ────────────────────────────────────────
export class UpdateProductDto {
  @IsOptional() @IsUUID('4') categoryId?: string;
  @IsOptional() @IsString() @MaxLength(255) name?: string;
  @IsOptional() @IsString() @MaxLength(255) slug?: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  basePrice?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  stockQuantity?: number;

  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsObject() specs?: Record<string, any>;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsNumber() weightKg?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}
