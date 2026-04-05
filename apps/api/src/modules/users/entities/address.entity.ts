import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ default: 'Home' }) label: string;
  @Column() line1: string;
  @Column({ nullable: true }) line2?: string;
  @Column() city: string;
  @Column() state: string;
  @Column() pincode: string;
  @Column({ default: 'India' }) country: string;
  @Column({ name: 'is_default', default: false }) isDefault: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user: User;
}
