import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'order_id' }) orderId: string;
  @Column({ name: 'product_id' }) productId: string;
  @Column({ name: 'variant_id', nullable: true }) variantId?: string;
  @Column({ name: 'product_name' }) productName: string;
  @Column({ name: 'product_sku', nullable: true }) productSku?: string;
  @Column() quantity: number;
  @Column({ name: 'unit_price', type: 'numeric', precision: 10, scale: 2 }) unitPrice: number;
  @Column({ name: 'total_price', type: 'numeric', precision: 10, scale: 2 }) totalPrice: number;
  @ManyToOne(() => Order, o => o.items, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'order_id' }) order: Order;
}
