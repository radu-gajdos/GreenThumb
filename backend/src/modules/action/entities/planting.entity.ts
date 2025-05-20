import { Column, ChildEntity } from 'typeorm';
import { Action } from './action.entity';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';

@ChildEntity('planting')
export class Planting extends Action {
    @Expose()
    @IsNotEmpty()
    @IsString()
    @Column({ length: 100 })
    cropType: string;

    @Expose()
    @IsOptional()
    @IsString()
    @Column({ length: 100, nullable: true })
    variety?: string;

    @Expose()
    @IsOptional()
    @IsString()
    @Column({ length: 50, nullable: true })
    seedingRate?: string;
}
