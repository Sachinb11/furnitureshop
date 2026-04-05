import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Address } from '../../users/entities/address.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum OrderStatus {
  PENDING='pending', CONFIRMED='confirmed', PROCESSING='processing',
  SHIPPED='shipped', DELIVERED='delivered', CANCELLED='cancelled', REFUNDED='refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ name: 'address_id' }) addressId: string;
  @Column({ name: 'order_number', unique: true }) orderNumber: string;
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING }) status: OrderStatus;
  @Column({ type: 'numeric', precision: 10, scale: 2 }) subtotal: number;
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 }) discount: number;
  @Column({ name: 'shipping_fee', type: 'numeric', precision: 10, scale: 2, default: 0 }) shippingFee: number;
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 }) tax: number;
  @Column({ type: 'numeric', precision: 10, scale: 2 }) total: number;
  @Column({ name: 'coupon_code', nullable: true }) couponCode?: string;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @CreateDateColumn({ name: 'placed_at' }) placedAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => OrderItem, i => i.order, { cascade: true, eager: true }) items: OrderItem[];
  @ManyToOne(() => Address) @JoinColumn({ name: 'address_id' }) address: Address;
  @OneToOne(() => Payment, p => p.order) payment: Payment;
}
