import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'category_id' }) categoryId: string;
  @Column() name: string;
  @Column({ unique: true }) slug: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ name: 'base_price', type: 'numeric', precision: 10, scale: 2 }) basePrice: number;
  @Column({ name: 'sale_price', type: 'numeric', precision: 10, scale: 2, nullable: true }) salePrice?: number;
  @Column({ name: 'stock_quantity', default: 0 }) stockQuantity: number;
  @Column({ nullable: true, unique: true }) sku?: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'is_featured', default: false }) isFeatured: boolean;
  @Column({ type: 'jsonb', default: '{}' }) specs: Record<string, any>;
  @Column({ type: 'text', array: true, default: '{}' }) tags: string[];
  @Column({ name: 'avg_rating', type: 'numeric', precision: 3, scale: 2, default: 0 }) avgRating: number;
  @Column({ name: 'review_count', default: 0 }) reviewCount: number;
  @Column({ name: 'meta_title', nullable: true }) metaTitle?: string;
  @Column({ name: 'meta_description', nullable: true }) metaDescription?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @ManyToOne(() => Category) @JoinColumn({ name: 'category_id' }) category: Category;
  @OneToMany(() => ProductImage, i => i.product, { cascade: true }) images: ProductImage[];
  @OneToMany(() => ProductVariant, v => v.product, { cascade: true }) variants: ProductVariant[];
}
