import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, JoinColumn } from 'typeorm';
import { Feature, Polygon } from 'geojson';
import { User } from '../../user/entities/user.entity';
import { Action } from '../../action/entities/action.entity';
import { Expose } from 'class-transformer';
import { FieldNote } from 'src/modules/fieldNote/entities/fieldNote.entity';
import { Conversation } from 'src/modules/conversation/entities/conversation.entity';

@Entity({ name: 'plots' })
export class Plot {
    @Expose({ groups: ['plot'] })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose({ groups: ['plot'] })
    @Column({ length: 100 })
    name: string;

    @Expose({ groups: ['plot'] })
    @Column({ type: 'float' })
    size: number;

    @Expose({ groups: ['plot'] })
    @Index({ spatial: true }) // this tells TypeORM to create a GiST index
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

    @ManyToOne(() => User, (user) => user.plots, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'ownerId' })
    owner: User;

    @Column()
    ownerId: string;

    @Expose({ groups: ['plot'] })
    @OneToMany(() => Action, (action) => action.plot, { cascade: true, eager: true })
    actions: Action[];

    @OneToMany(() => FieldNote, (fieldNote) => fieldNote.plot, { cascade: true, eager: true })
    @Expose({ groups: ['plot'] })
    fieldNotes: FieldNote[];
    
    @OneToMany(() => Conversation, (conversation) => conversation.plot, { cascade: true, eager: true })
    @Expose({ groups: ['plot'] })
    conversations: Conversation[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
