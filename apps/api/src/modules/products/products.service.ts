import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

function paginate<T>(data: T[], total: number, page: number, limit: number) {
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)      private repo:      Repository<Product>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
  ) {}

  // ── CREATE ─────────────────────────────────────────────────────────────────
  async create(dto: CreateProductDto): Promise<Product> {
    // 1. Slug uniqueness check
    const slugExists = await this.repo.findOneBy({ slug: dto.slug });
    if (slugExists) {
      throw new BadRequestException(`Slug "${dto.slug}" is already taken. Choose a different slug.`);
    }

    // 2. SKU uniqueness check (if provided)
    if (dto.sku) {
      const skuExists = await this.repo.findOneBy({ sku: dto.sku });
      if (skuExists) throw new BadRequestException(`SKU "${dto.sku}" already exists.`);
    }

    const { images, ...productData } = dto;

    // 3. Save product
    // TypeORM recognises categoryId directly because the entity has
    //   @Column({ name: 'category_id' }) categoryId: string
    // so we do NOT need to wrap it in { id: categoryId }
    const product = await this.repo.save(
      this.repo.create({
        ...productData,
        specs: productData.specs ?? {},
        tags:  productData.tags  ?? [],
      }),
    );

    // 4. Save images
    if (images?.length) {
      const imgEntities = images.map((img, i) =>
        this.imageRepo.create({
          productId: product.id,
          url:       img.url,
          altText:   img.altText ?? product.name,
          isPrimary: img.isPrimary ?? i === 0,
          sortOrder: img.sortOrder ?? i,
        }),
      );
      await this.imageRepo.save(imgEntities);
    }

    return this.findById(product.id);
  }

  // ── LIST ────────────────────────────────────────────────────────────────────
  async findAll(filters: any) {
    const {
      page = 1, limit = 24,
      sortBy = 'createdAt', order = 'DESC',
      categoryId, search, minPrice, maxPrice,
      isFeatured, inStock, tags,
    } = filters;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images', 'images.isPrimary = true')
      .where('p.isActive = true');

    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });

    if (search) {
      qb.andWhere(
        '(p.name ILIKE :s OR p.description ILIKE :s OR p.sku ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    if (minPrice !== undefined) {
      qb.andWhere('CAST(COALESCE(p.salePrice, p.basePrice) AS DECIMAL) >= :min', { min: minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('CAST(COALESCE(p.salePrice, p.basePrice) AS DECIMAL) <= :max', { max: maxPrice });
    }
    if (isFeatured !== undefined) {
      qb.andWhere('p.isFeatured = :feat', { feat: isFeatured === 'true' || isFeatured === true });
    }
    if (inStock) {
      qb.andWhere('p.stockQuantity > 0');
    }
    if (tags) {
      const tagArr = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags;
      qb.andWhere('p.tags && :tags', { tags: tagArr });
    }

    const validSortFields = ['createdAt', 'updatedAt', 'basePrice', 'avgRating', 'name', 'stockQuantity'];
    const safeSort  = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const [items, total] = await qb
      .orderBy(`p.${safeSort}`, safeOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return paginate(items, total, +page, +limit);
  }

  // ── GET BY SLUG ─────────────────────────────────────────────────────────────
  async findBySlug(slug: string): Promise<Product> {
    const product = await this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.variants', 'variants', 'variants.isActive = true')
      .where('(p.slug = :slug OR p.id = :slug) AND p.isActive = true', { slug })
      .orderBy('images.sortOrder', 'ASC')
      .getOne();

    if (!product) throw new NotFoundException(`Product "${slug}" not found`);
    return product;
  }

  // ── GET BY ID (internal) ────────────────────────────────────────────────────
  async findById(id: string): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['category', 'images', 'variants'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findById(id); // throws 404 if not found

    const { images, ...productData } = dto as any;

    // If slug changed, check uniqueness
    if (productData.slug) {
      const existing = await this.repo.findOneBy({ slug: productData.slug });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Slug "${productData.slug}" is already taken.`);
      }
    }

    await this.repo.update(id, productData);

    // Replace images if provided
    if (images?.length) {
      await this.imageRepo.delete({ productId: id });
      const imgEntities = images.map((img: any, i: number) =>
        this.imageRepo.create({
          productId: id,
          url:       img.url,
          altText:   img.altText,
          isPrimary: img.isPrimary ?? i === 0,
          sortOrder: img.sortOrder ?? i,
        }),
      );
      await this.imageRepo.save(imgEntities);
    }

    return this.findById(id);
  }

  // ── DELETE (soft) ───────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findById(id);
    await this.repo.update(id, { isActive: false });
    return { message: 'Product deleted successfully' };
  }

  // ── FEATURED ────────────────────────────────────────────────────────────────
  async getFeatured(limit = 8): Promise<Product[]> {
    return this.repo.find({
      where: { isFeatured: true, isActive: true },
      relations: ['images', 'category'],
      take: limit,
      order: { avgRating: 'DESC', createdAt: 'DESC' },
    });
  }

  // ── STOCK HELPERS ────────────────────────────────────────────────────────────
  async decrementStock(id: string, qty: number) {
    await this.repo.decrement({ id }, 'stockQuantity', qty);
  }

  async incrementStock(id: string, qty: number) {
    await this.repo.increment({ id }, 'stockQuantity', qty);
  }
}
