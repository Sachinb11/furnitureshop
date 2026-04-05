import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
@Unique(['productId','userId'])
export class Review {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'product_id' }) productId: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ type: 'smallint' }) rating: number;
  @Column({ nullable: true }) title?: string;
  @Column({ type: 'text', nullable: true }) body?: string;
  @Column({ name: 'is_verified_purchase', default: false }) isVerifiedPurchase: boolean;
  @Column({ name: 'is_approved', default: true }) isApproved: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @ManyToOne(() => Product) @JoinColumn({ name: 'product_id' }) product: Product;
  @ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user: User;
}
