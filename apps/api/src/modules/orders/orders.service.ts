import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, dto: { addressId: string; items: { productId: string; variantId?: string; quantity: number }[]; couponCode?: string; notes?: string }) {
    return this.dataSource.transaction(async manager => {
      let subtotal = 0;
      const orderItems: Partial<OrderItem>[] = [];
      for (const item of dto.items) {
        const product = await manager.findOne(Product, { where: { id: item.productId, isActive: true } });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
        if (product.stockQuantity < item.quantity) throw new BadRequestException(`Insufficient stock for "${product.name}"`);
        const unitPrice = Number(product.salePrice ?? product.basePrice);
        subtotal += unitPrice * item.quantity;
        orderItems.push({ productId: item.productId, variantId: item.variantId, productName: product.name, productSku: product.sku, quantity: item.quantity, unitPrice, totalPrice: unitPrice * item.quantity });
        await manager.decrement(Product, { id: item.productId }, 'stockQuantity', item.quantity);
      }
      const shippingFee = subtotal >= 10000 ? 0 : 199;
      const tax = +(subtotal * 0.18).toFixed(2);
      const total = +(subtotal + shippingFee + tax).toFixed(2);
      const count = await manager.count(Order);
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
      const order = await manager.save(Order, manager.create(Order, { userId, addressId: dto.addressId, orderNumber, subtotal: +subtotal.toFixed(2), shippingFee, tax, total, couponCode: dto.couponCode, notes: dto.notes }));
      await manager.save(OrderItem, orderItems.map(i => manager.create(OrderItem, { ...i, orderId: order.id })));
      return manager.findOne(Order, { where: { id: order.id }, relations: ['items','address'] });
    });
  }

  async findUserOrders(userId: string, page = 1, limit = 10) {
    const [data, total] = await this.orderRepo.findAndCount({ where: { userId }, relations: ['items'], order: { placedAt: 'DESC' }, skip: (page-1)*limit, take: limit });
    return paginate(data, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['items','address','payment'] });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException();
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepo.save(order);
  }

  async findAll(filters: any) {
    const { page = 1, limit = 20, status, search } = filters;
    const qb = this.orderRepo.createQueryBuilder('o').leftJoinAndSelect('o.items','items').leftJoinAndSelect('o.payment','payment').orderBy('o.placedAt','DESC');
    if (status) qb.where('o.status = :status', { status });
    if (search) qb.andWhere('o.orderNumber ILIKE :s', { s: `%${search}%` });
    const [data, total] = await qb.skip((page-1)*limit).take(limit).getManyAndCount();
    return paginate(data, total, page, limit);
  }
}
