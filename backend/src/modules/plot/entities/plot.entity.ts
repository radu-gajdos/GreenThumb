import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Action } from '../../action/entities/action.entity';

@Entity({ name: 'plots' })
export class Plot {
    @Expose({ groups: ['plot', 'relation'] })
    @PrimaryGeneratedColumn()
    id: number;

    @Expose({ groups: ['plot', 'relation'] })
    @Column({ nullable: false, length: 100 })
    name: string;

    @Expose({ groups: ['plot'] })
    @Column({ nullable: false, type: 'float' })
    size: number;

    @Expose({ groups: ['plot'] })
    @Column({ nullable: false, type: 'float' })
    latitude: number;

    @Expose({ groups: ['plot'] })
    @Column({ nullable: false, type: 'float' })
    longitude: number;

    @Expose({ groups: ['plot'] })
    @Column({ nullable: true, length: 255 })
    topography?: string;

    @Expose({ groups: ['plot'] })
    @Column({ nullable: true, length: 255 })
    soilType?: string;

    @Expose({ groups: ['plot', 'relation'] })
    @ManyToOne(() => User, (user) => user.plots, { eager: true, onDelete: 'CASCADE' })
    owner: User;

    @Expose({ groups: ['admin'] })
    @CreateDateColumn()
    createdAt: Date;
    
    @Expose({ groups: ['admin'] })
    @UpdateDateColumn()
    updatedAt: Date;
    
    @Expose({ groups: ['admin'] })
    @DeleteDateColumn()
    deletedAt?: Date;

    @Expose({ groups: ['plot', 'relation'] })
    @OneToMany(() => Action, (action) => action.plot, { cascade: true, eager: true })
    actions: Action[];
}
