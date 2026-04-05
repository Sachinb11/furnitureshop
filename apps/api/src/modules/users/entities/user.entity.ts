import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ name: 'password_hash', nullable: true }) @Exclude() passwordHash?: string;
  @Column({ name: 'first_name' }) firstName: string;
  @Column({ name: 'last_name' }) lastName: string;
  @Column({ nullable: true }) phone?: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER }) role: UserRole;
  @Column({ name: 'is_verified', default: false }) isVerified: boolean;
  @Column({ name: 'firebase_uid', nullable: true, unique: true }) firebaseUid?: string;
  @Column({ name: 'avatar_url', nullable: true }) avatarUrl?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
