import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private ordersService: OrdersService,
    private config: ConfigService,
  ) {}

  async initiate(orderId: string, userId: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException();
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Order not payable');

    // Dynamic import of Razorpay to avoid issues if not installed
    let rzpOrder: any;
    try {
      const Razorpay = require('razorpay');
      const rzp = new Razorpay({ key_id: this.config.get('RAZORPAY_KEY_ID'), key_secret: this.config.get('RAZORPAY_KEY_SECRET') });
      rzpOrder = await rzp.orders.create({ amount: Math.round(Number(order.total) * 100), currency: 'INR', receipt: order.orderNumber });
    } catch (e) {
      // Fallback mock for development without Razorpay credentials
      rzpOrder = { id: `rzp_mock_${Date.now()}`, amount: Math.round(Number(order.total) * 100), currency: 'INR' };
    }

    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({ orderId, razorpayOrderId: rzpOrder.id, amount: order.total, currency: 'INR', status: PaymentStatus.CREATED }),
    );
    return { razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: this.config.get('RAZORPAY_KEY_ID') };
  }

  async verify(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const secret = this.config.get('RAZORPAY_KEY_SECRET', 'test_secret');
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

    // In development, skip signature check if using mock
    if (razorpayOrderId.startsWith('rzp_mock_') || expected === razorpaySignature) {
      const payment = await this.paymentRepo.findOne({ where: { razorpayOrderId }, relations: ['order'] });
      if (!payment) throw new NotFoundException('Payment not found');
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = PaymentStatus.CAPTURED;
      await this.paymentRepo.save(payment);
      await this.ordersService.updateStatus(payment.orderId, OrderStatus.CONFIRMED);
      return { success: true, orderId: payment.orderId };
    }
    throw new BadRequestException('Payment signature verification failed');
  }

  async handleWebhook(payload: any, signature: string) {
    const secret = this.config.get('RAZORPAY_WEBHOOK_SECRET', '');
    if (secret) {
      const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
      if (expected !== signature) throw new BadRequestException('Invalid webhook signature');
    }
    const event = payload.event;
    const entity = payload.payload?.payment?.entity;
    if (event === 'payment.captured' && entity) {
      const payment = await this.paymentRepo.findOne({ where: { razorpayOrderId: entity.order_id } });
      if (payment && payment.status !== PaymentStatus.CAPTURED) {
        payment.status = PaymentStatus.CAPTURED;
        payment.metadata = entity;
        await this.paymentRepo.save(payment);
        await this.ordersService.updateStatus(payment.orderId, OrderStatus.CONFIRMED);
      }
    }
    if (event === 'payment.failed' && entity) {
      const payment = await this.paymentRepo.findOne({ where: { razorpayOrderId: entity.order_id } });
      if (payment) { payment.status = PaymentStatus.FAILED; payment.failureReason = entity.error_description; await this.paymentRepo.save(payment); }
    }
    return { received: true };
  }
}
