import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Plot } from '../../plot/entities/plot.entity';

@Entity({ name: 'field_notes' })
export class FieldNote {
  @Expose({ groups: ['field_note'] })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose({ groups: ['field_note'] })
  @Column({ type: 'text' })
  title: string;
  
  @Expose({ groups: ['field_note'] })
  @Column({ type: 'text' })
  message: string;

  @Expose({ groups: ['field_note'] })
  @ManyToOne(() => Plot, (plot) => plot.fieldNotes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plotId' })
  plot: Plot;

  @Column()
  plotId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
