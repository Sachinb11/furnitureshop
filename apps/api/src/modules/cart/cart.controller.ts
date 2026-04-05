import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private svc: CartService) {}
  @Get() @ApiOperation({ summary: 'Get my cart' }) getCart(@CurrentUser() user: User) { return this.svc.getCart(user.id); }
  @Post('items') @ApiOperation({ summary: 'Add item to cart' })
  addItem(@CurrentUser() user: User, @Body() body: { productId: string; quantity?: number; variantId?: string }) {
    return this.svc.addItem(user.id, body.productId, body.quantity ?? 1, body.variantId);
  }
  @Patch('items/:id') updateItem(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string, @Body('quantity') qty: number) {
    return this.svc.updateItem(user.id, id, qty);
  }
  @Delete('items/:id') removeItem(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.removeItem(user.id, id);
  }
  @Delete() clearCart(@CurrentUser() user: User) { return this.svc.clearCart(user.id); }
}
