import { Column, ChildEntity } from 'typeorm';
import { Action } from './action.entity';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

@ChildEntity('watering')
export class Watering extends Action {
    @Expose()
    @IsNotEmpty()
    @IsString()
    @Column({ length: 50 })
    method: string;

    @Expose()
    @IsNumber()
    @Min(0)
    @Column({ type: 'float', nullable: true })
    amount?: number;

    @Expose()
    @IsOptional()
    @IsString()
    @Column({ length: 100, nullable: true })
    waterSource?: string;
}
