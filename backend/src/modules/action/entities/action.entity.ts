import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, TableInheritance, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { Plot } from '../../plot/entities/plot.entity';

@Entity({ name: 'actions' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Action {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose()
    @Column({ type: 'varchar' })
    type: string;

    @Expose()
    @Column({ name: 'plotId' })
    plotId: string;

    @Expose()
    @ManyToOne(() => Plot, (plot) => plot.actions, { onDelete: 'CASCADE' })
    plot: Plot;

    @Expose()
    @Column({ type: 'timestamp' })
    date: Date;

    @Expose()
    @Column({ 
        type: 'enum', 
        enum: ['planned', 'in_progress', 'completed', 'cancelled'],
        default: 'planned'
    })
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';

    @Expose()
    @Column({ type: 'text', nullable: true })
    description?: string;

    @Expose()
    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}