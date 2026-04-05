import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [users, total] = await this.userRepo.findAndCount({
      order: { createdAt: 'DESC' }, skip: (page-1)*limit, take: limit,
    });
    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total/limit) } };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: Partial<User>): Promise<User> {
    await this.findById(id);
    await this.userRepo.update(id, dto);
    return this.findById(id);
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return this.addressRepo.find({ where: { userId }, order: { isDefault: 'DESC' } });
  }

  async createAddress(userId: string, dto: Partial<Address>): Promise<Address> {
    if (dto.isDefault) await this.addressRepo.update({ userId }, { isDefault: false });
    return this.addressRepo.save(this.addressRepo.create({ ...dto, userId }));
  }

  async updateAddress(userId: string, id: string, dto: Partial<Address>): Promise<Address> {
    const addr = await this.addressRepo.findOne({ where: { id, userId } });
    if (!addr) throw new NotFoundException('Address not found');
    if (dto.isDefault) await this.addressRepo.update({ userId }, { isDefault: false });
    await this.addressRepo.update(id, dto);
    return this.addressRepo.findOneBy({ id });
  }

  async deleteAddress(userId: string, id: string): Promise<{ message: string }> {
    const addr = await this.addressRepo.findOne({ where: { id, userId } });
    if (!addr) throw new NotFoundException('Address not found');
    await this.addressRepo.delete(id);
    return { message: 'Address deleted' };
  }
}
