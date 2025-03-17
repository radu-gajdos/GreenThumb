import { Column, ChildEntity } from 'typeorm';
import { Action } from './action.entity';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

@ChildEntity('treatment')
export class Treatment extends Action {
    @Expose()
    @IsNotEmpty()
    @IsString()
    @Column({ length: 100 })
    pesticideType: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @Column({ length: 100 })
    targetPest: string;

    @Expose()
    @IsPositive()
    @IsNumber()
    @Column({ type: 'float' })
    dosage: number;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @Column({ length: 100 })
    applicationMethod: string;
}