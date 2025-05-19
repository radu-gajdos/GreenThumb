import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, TableInheritance, ChildEntity } from 'typeorm';
import { Expose } from 'class-transformer';
import { Plot } from '../../plot/entities/plot.entity';

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
}