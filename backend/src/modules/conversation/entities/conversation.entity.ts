import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Plot } from '../../plot/entities/plot.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'uuid' })
  plotId: string;

  @Column({ type: 'varchar', length: 10, default: 'ro' })
  language: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Plot, (plot) => plot.conversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plotId' })
  plot: Plot;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];

  getLastMessage(): Message | null {
    if (!this.messages || this.messages.length === 0) {
      return null;
    }
    return this.messages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }

  getLastMessagePreview(maxLength: number = 60): string {
    const lastMessage = this.getLastMessage();
    if (!lastMessage) {
      return 'Nicio conversație încă';
    }

    if (lastMessage.content.length <= maxLength) {
      return lastMessage.content;
    }

    return lastMessage.content.substring(0, maxLength).trim() + '...';
  }

  updateMetadata(): void {
    this.messageCount = this.messages ? this.messages.length : 0;
    this.lastMessageAt = new Date();
  }
}