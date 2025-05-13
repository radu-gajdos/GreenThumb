import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { Feature, Polygon } from 'geojson';
import { User } from '../../user/entities/user.entity';
import { Action } from '../../action/entities/action.entity';
import { Expose } from 'class-transformer';

@Entity({ name: 'plots' })
export class Plot {
    @Expose({ groups: ['plot'] })
    @PrimaryGeneratedColumn()
    id: number;

    @Expose({ groups: ['plot'] })
    @Column({ length: 100 })
    name: string;

    @Expose({ groups: ['plot'] })
    @Column({ type: 'float' })
    size: number;

    @Expose({ groups: ['plot'] })
    @Index({ spatial: true }) // this tells TypeORM to create a GiST index
    // src/modules/plot/entities/plot.entity.ts
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326,
        nullable: false,
        transformer: {
            // incoming from DB (Buffer or WKB string) → parsed GeoJSON
            from: (value: Buffer | string) => {
                try {
                    // if Postgres returned text‐encoded GeoJSON
                    return JSON.parse(String(value));
                } catch {
                    // fallback: leave it to the DB layer
                    return value;
                }
            },
            // outgoing: leave as-is (TypeORM will serialize GeoJSON to WKB for Postgres)
            to: (value: any) => value,
        },
    })
    boundary: Polygon;


    @Expose({ groups: ['plot'] })
    @Column({ nullable: true, length: 255 })
    topography?: string;

    @Expose({ groups: ['plot'] })
    @Column({ nullable: true, length: 255 })
    soilType?: string;

    @Expose({ groups: ['plot'] })
    @ManyToOne(() => User, (user) => user.plots, { eager: true, onDelete: 'CASCADE' })
    owner: User;

    @Expose({ groups: ['plot'] })
    @OneToMany(() => Action, (action) => action.plot, { cascade: true, eager: true })
    actions: Action[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
