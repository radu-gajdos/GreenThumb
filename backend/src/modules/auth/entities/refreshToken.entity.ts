import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { ActiveSession } from './activeSession.entity';

@Entity('refreshTokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()

  id: number;

  @Column()
  userId: string;

  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  lastUsedAt?: Date;

  @Column({ nullable: true, default: null })
  userAgent?: string;

  @Column({ nullable: true, default: null })
  ipAddress?: string;

  @Column({ default: false })
  isRememberMe: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ nullable: true })
  replacedByToken: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => ActiveSession, (activeSession) => activeSession.refreshToken)
  activeSessions: ActiveSession[];

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
  
  @DeleteDateColumn()
  deletedAt?: Date;
}
