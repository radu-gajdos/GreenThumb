import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';

@Entity('authLogs')
export class AuthLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ nullable: true, default: null })
  action?: string;

  @Column({ nullable: true, default: null })
  ip?: string;

  @Column({ nullable: true, default: null })
  userAgent?: string;

  @Column({ nullable: true, default: null })
  statusCode?: number;

  @Column({ nullable: true, default: null })
  duration?: number;

  @Column({ nullable: true, default: null })
  additionalInfo?: string;

  @ManyToOne(() => User, (user) => user.authLogs, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
  
  @DeleteDateColumn()
  deletedAt?: Date;
}
