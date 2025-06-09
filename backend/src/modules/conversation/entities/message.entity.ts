import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({
    type: 'enum',
    enum: MessageSender,
    default: MessageSender.USER,
  })
  sender: MessageSender;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isSavedAsFieldNote: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fieldNoteId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  isFromAI(): boolean {
    return this.sender === MessageSender.AI;
  }

  isFromUser(): boolean {
    return this.sender === MessageSender.USER;
  }

  getPreview(maxLength: number = 100): string {
    if (this.content.length <= maxLength) {
      return this.content;
    }
    return this.content.substring(0, maxLength).trim() + '...';
  }

  markAsRead(): void {
    this.isRead = true;
  }

  markAsSavedAsFieldNote(fieldNoteId: string): void {
    this.isSavedAsFieldNote = true;
    this.fieldNoteId = fieldNoteId;
  }
}