import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private svc: ReviewsService) {}
  @Get() findAll(@Param('productId') productId: string, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.svc.findForProduct(productId, +page, +limit);
  }
  @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  create(@Param('productId') productId: string, @CurrentUser() user: User, @Body() dto: any) {
    return this.svc.create(user.id, productId, dto);
  }
}
