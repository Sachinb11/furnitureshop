import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order)   private orderRepo:   Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User)    private userRepo:    Repository<User>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {}

  async getDashboard() {
    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, totalUsers, totalProducts] = await Promise.all([
      this.orderRepo.count(),
      this.userRepo.count(),
      this.productRepo.count({ where: { isActive: true } }),
    ]);

    // Total revenue
    const revResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'total')
      .where('p.status = :s', { s: PaymentStatus.CAPTURED })
      .getRawOne();

    // Monthly revenue
    const monthResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'total')
      .where('p.status = :s AND p.createdAt >= :start', {
        s: PaymentStatus.CAPTURED, start: startOfMonth,
      })
      .getRawOne();

    // Orders by status
    const ordersByStatus = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany();

    // Recent 10 orders
    const recentOrders = await this.orderRepo.find({
      order: { placedAt: 'DESC' },
      take: 10,
    });

    // Low stock products (stock < 10)
    const lowStockProducts = await this.productRepo
      .createQueryBuilder('p')
      .where('p.isActive = true AND p.stockQuantity < 10')
      .orderBy('p.stockQuantity', 'ASC')
      .take(10)
      .getMany();

    return {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue:   parseFloat(revResult?.total   ?? '0'),
      monthlyRevenue: parseFloat(monthResult?.total ?? '0'),
      ordersByStatus,
      recentOrders,
      lowStockProducts,
    };
  }

  async getAllOrders(filters: any) {
    const { page = 1, limit = 20, status, search } = filters;

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .leftJoinAndSelect('o.payment', 'payment')
      .orderBy('o.placedAt', 'DESC');

    if (status) qb.andWhere('o.status = :status', { status });
    if (search) {
      qb.andWhere('(o.orderNumber ILIKE :s)', { s: `%${search}%` });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAllProducts(filters: any) {
    const { page = 1, limit = 20, search, category } = filters;

    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .orderBy('p.createdAt', 'DESC');

    if (search) {
      qb.andWhere('(p.name ILIKE :s OR p.sku ILIKE :s)', { s: `%${search}%` });
    }
    if (category) {
      qb.andWhere('p.categoryId = :cid', { cid: category });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAllUsers(filters: any) {
    const { page = 1, limit = 20, search } = filters;

    const qb = this.userRepo
      .createQueryBuilder('u')
      .orderBy('u.createdAt', 'DESC');

    if (search) {
      qb.andWhere(
        '(u.email ILIKE :s OR u.firstName ILIKE :s OR u.lastName ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
