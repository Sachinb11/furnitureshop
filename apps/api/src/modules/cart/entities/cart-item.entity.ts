import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'cart_id' }) cartId: string;
  @Column({ name: 'product_id' }) productId: string;
  @Column({ name: 'variant_id', nullable: true }) variantId?: string;
  @Column({ default: 1 }) quantity: number;
  @Column({ name: 'unit_price', type: 'numeric', precision: 10, scale: 2 }) unitPrice: number;
  @ManyToOne(() => Cart, c => c.items, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'cart_id' }) cart: Cart;
  @ManyToOne(() => Product, { eager: true }) @JoinColumn({ name: 'product_id' }) product: Product;
  @ManyToOne(() => ProductVariant, { nullable: true, eager: true }) @JoinColumn({ name: 'variant_id' }) variant?: ProductVariant;
}
