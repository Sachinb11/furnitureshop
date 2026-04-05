import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', nullable: true, unique: true }) userId?: string;
  @Column({ name: 'session_id', nullable: true, unique: true }) sessionId?: string;
  @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => CartItem, i => i.cart, { cascade: true, eager: true }) items: CartItem[];
}
