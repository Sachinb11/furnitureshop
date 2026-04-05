import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private itemRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  private async getOrCreate(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items','items.product','items.variant'] });
    if (!cart) {
      cart = await this.cartRepo.save(this.cartRepo.create({
        userId,
        expiresAt: new Date(Date.now() + 30 * 86400_000),
      }));
      cart.items = [];
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreate(userId);
    const subtotal = (cart.items ?? []).reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
    const itemCount = (cart.items ?? []).reduce((s, i) => s + i.quantity, 0);
    return { ...cart, subtotal: +subtotal.toFixed(2), itemCount };
  }

  async addItem(userId: string, productId: string, quantity = 1, variantId?: string) {
    const cart = await this.getOrCreate(userId);
    const product = await this.productRepo.findOne({ where: { id: productId, isActive: true } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stockQuantity < quantity) throw new BadRequestException(`Only ${product.stockQuantity} units available`);

    const existing = await this.itemRepo.findOne({ where: { cartId: cart.id, productId, variantId: variantId ?? null as any } });
    if (existing) {
      existing.quantity += quantity;
      await this.itemRepo.save(existing);
    } else {
      await this.itemRepo.save(this.itemRepo.create({
        cartId: cart.id, productId, variantId, quantity,
        unitPrice: product.salePrice ?? product.basePrice,
      }));
    }
    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreate(userId);
    const item = await this.itemRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('Cart item not found');
    if (quantity <= 0) { await this.itemRepo.remove(item); }
    else { item.quantity = quantity; await this.itemRepo.save(item); }
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreate(userId);
    const item = await this.itemRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.itemRepo.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreate(userId);
    await this.itemRepo.delete({ cartId: cart.id });
    return this.getCart(userId);
  }
}
