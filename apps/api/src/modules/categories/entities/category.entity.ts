import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'parent_id', nullable: true }) parentId?: string;
  @Column() name: string;
  @Column({ unique: true }) slug: string;
  @Column({ nullable: true, type: 'text' }) description?: string;
  @Column({ name: 'image_url', nullable: true }) imageUrl?: string;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'meta_title', nullable: true }) metaTitle?: string;
  @Column({ name: 'meta_description', nullable: true }) metaDescription?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @ManyToOne(() => Category, c => c.children, { nullable: true }) @JoinColumn({ name: 'parent_id' }) parent?: Category;
  @OneToMany(() => Category, c => c.parent) children: Category[];
}
