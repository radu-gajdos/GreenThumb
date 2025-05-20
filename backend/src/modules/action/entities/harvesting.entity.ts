import { Column, ChildEntity } from 'typeorm';
import { Action } from './action.entity';
import { Expose } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsOptional, Min } from 'class-validator';

@ChildEntity('harvesting')
export class Harvesting extends Action {
    @Expose()
    @IsNumber()
    @Min(0)
    @Column({ type: 'float' })
    cropYield: number;

    @Expose()
    @IsOptional()
    @IsString()
    @Column({ length: 500, nullable: true })
    comments?: string;
}
