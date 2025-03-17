import { Column, ChildEntity } from 'typeorm';
import { Action } from './action.entity';
import { Expose } from 'class-transformer';
import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

@ChildEntity('soil_reading')
export class SoilReading extends Action {
    @Expose()
    @IsNumber()
    @Min(0)
    @Max(14)
    @Column({ type: 'float', nullable: false })
    ph: number;

    @Expose()
    @IsNumber()
    @Min(0)
    @Column({ type: 'float', nullable: true })
    nitrogen?: number;

    @Expose()
    @IsNumber()
    @Min(0)
    @Column({ type: 'float', nullable: true })
    phosphorus?: number;

    @Expose()
    @IsNumber()
    @Min(0)
    @Column({ type: 'float', nullable: true })
    potassium?: number;

    @Expose()
    @IsOptional()
    @IsString()
    @Column({ length: 255, nullable: true })
    organicMatter?: string;
}
