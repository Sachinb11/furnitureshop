import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, ParseUUIDPipe,
  HttpCode, HttpStatus, Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private svc: ProductsService) {}

  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: 'List products with filters & pagination' })
  findAll(@Query() filters: any) {
    return this.svc.findAll(filters);
  }

  @Get('featured')
  @SkipThrottle()
  @ApiOperation({ summary: 'Get featured products' })
  getFeatured(@Query('limit') limit?: string) {
    return this.svc.getFeatured(limit ? parseInt(limit, 10) : 8);
  }

  @Get(':slug')
  @SkipThrottle()
  @ApiOperation({ summary: 'Get product by slug or id' })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create product' })
  create(@Body() dto: CreateProductDto) {
    // ── DEBUG LOG ─ Remove after confirming fix works ──────────────────────
    this.logger.debug('CREATE PRODUCT DTO received:', JSON.stringify(dto, null, 2));
    // ──────────────────────────────────────────────────────────────────────
    return this.svc.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update product' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    this.logger.debug(`UPDATE PRODUCT ${id}:`, JSON.stringify(dto, null, 2));
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Soft delete product' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
