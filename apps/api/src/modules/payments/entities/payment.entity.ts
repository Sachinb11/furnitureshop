import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentStatus {
  CREATED='created', AUTHORIZED='authorized', CAPTURED='captured', FAILED='failed', REFUNDED='refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'order_id', unique: true }) orderId: string;
  @Column({ name: 'razorpay_order_id', nullable: true, unique: true }) razorpayOrderId?: string;
  @Column({ name: 'razorpay_payment_id', nullable: true }) razorpayPaymentId?: string;
  @Column({ name: 'razorpay_signature', nullable: true }) razorpaySignature?: string;
  @Column({ type: 'numeric', precision: 10, scale: 2 }) amount: number;
  @Column({ default: 'INR' }) currency: string;
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.CREATED }) status: PaymentStatus;
  @Column({ name: 'failure_reason', nullable: true, type: 'text' }) failureReason?: string;
  @Column({ type: 'jsonb', default: '{}' }) metadata: Record<string, any>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToOne(() => Order, o => o.payment) @JoinColumn({ name: 'order_id' }) order: Order;
}
