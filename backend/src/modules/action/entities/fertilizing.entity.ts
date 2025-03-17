import { Column, ChildEntity } from 'typeorm';
import { Action } from './action.entity';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsPositive, IsNumber } from 'class-validator';

@ChildEntity('fertilizing')
export class Fertilizing extends Action {
    @Expose()
    @IsNotEmpty()
    @IsString()
    @Column({ length: 100 })
    fertilizerType: string;

    @Expose()
    @IsPositive()
    @IsNumber()
    @Column({ type: 'float' })
    applicationRate: number;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @Column({ length: 100 })
    method: string;
}
