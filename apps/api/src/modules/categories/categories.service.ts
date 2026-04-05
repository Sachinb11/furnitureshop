import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  findAll() { return this.repo.find({ where: { isActive: true }, order: { sortOrder: 'ASC', name: 'ASC' } }); }

  async findBySlug(slug: string) {
    const c = await this.repo.findOne({ where: { slug, isActive: true }, relations: ['children','parent'] });
    if (!c) throw new NotFoundException(`Category '${slug}' not found`);
    return c;
  }

  async findById(id: string) {
    const c = await this.repo.findOneBy({ id });
    if (!c) throw new NotFoundException('Category not found');
    return c;
  }

  async create(dto: any) {
    const exists = await this.repo.findOneBy({ slug: dto.slug });
    if (exists) throw new ConflictException('Slug already exists');
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: any) {
    await this.findById(id);
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.repo.update(id, { isActive: false });
    return { message: 'Category deleted' };
  }
}
