import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, TableInheritance, ChildEntity, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { Plot } from '../../plot/entities/plot.entity';
import { IsDate } from 'class-validator';

@Entity({ name: 'actions' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Action {
    @PrimaryGeneratedColumn()
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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}