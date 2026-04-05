import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async create(userId: string, productId: string, dto: { rating: number; title?: string; body?: string }) {
    const exists = await this.reviewRepo.findOne({ where: { userId, productId } });
    if (exists) throw new ConflictException('You have already reviewed this product');
    const review = await this.reviewRepo.save(this.reviewRepo.create({ ...dto, userId, productId }));
    await this.recalcRating(productId);
    return review;
  }

  async findForProduct(productId: string, page = 1, limit = 10) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { productId, isApproved: true }, relations: ['user'], order: { createdAt: 'DESC' },
      skip: (page-1)*limit, take: limit,
    });
    return paginate(data, total, page, limit);
  }

  private async recalcRating(productId: string) {
    const result = await this.reviewRepo.createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg').addSelect('COUNT(*)', 'count')
      .where('r.productId = :productId AND r.isApproved = true', { productId }).getRawOne();
    await this.productRepo.update(productId, { avgRating: parseFloat(result.avg ?? '0'), reviewCount: parseInt(result.count ?? '0') });
  }
}
