import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { RefreshToken } from './refreshToken.entity';

@Entity('activeSessions')
export class ActiveSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  refreshTokenId: number;

  @Column({ nullable: true, default: null })
  userAgent: string;

  @Column({ nullable: true, default: null })
  ipAddress: string;

  @Column()
  lastActivityAt: Date;

  @Column()
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.activeSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => RefreshToken, (refreshToken) => refreshToken.activeSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'refreshTokenId', referencedColumnName: 'id' })
  refreshToken: RefreshToken;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
  
  @DeleteDateColumn()
  deletedAt?: Date;
}
