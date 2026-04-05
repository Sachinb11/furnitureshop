import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'product_id' }) productId: string;
  @Column() name: string;
  @Column({ nullable: true, unique: true }) sku?: string;
  @Column({ name: 'price_modifier', type: 'numeric', precision: 10, scale: 2, default: 0 }) priceModifier: number;
  @Column({ name: 'stock_quantity', default: 0 }) stockQuantity: number;
  @Column({ type: 'jsonb', default: '{}' }) attributes: Record<string, any>;
  @Column({ name: 'image_url', nullable: true }) imageUrl?: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @ManyToOne(() => Product, p => p.variants, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'product_id' }) product: Product;
}
