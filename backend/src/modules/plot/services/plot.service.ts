import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Plot } from '../entities/plot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlotDto } from '../dto/create-plot.dto';
import { UpdatePlotDto } from '../dto/update-plot.dto';

@Injectable()
export class PlotService {
    constructor(
        @InjectRepository(Plot)
        private readonly plotRepository: Repository<Plot>,
    ) {}

    async create(input: CreatePlotDto): Promise<Plot> {
        const plot = this.plotRepository.create(input);
        return this.plotRepository.save(plot);
    }

    async findAll(): Promise<Plot[]> {
        return this.plotRepository.find({ relations: ['actions'] });
    }

    async findOne(id: number): Promise<Plot> {
        const plot = await this.plotRepository.findOne({ where: { id }, relations: ['actions'] });
        if (!plot) throw new NotFoundException();
        return plot;
    }

    async update(input: UpdatePlotDto): Promise<Plot> {
        const plot = await this.findOne(input.id);
        Object.assign(plot, input);
        return this.plotRepository.save(plot);
    }

    async remove(id: number): Promise<boolean> {
        const plot = await this.findOne(id);
        await this.plotRepository.remove(plot);
        return true;
    }
}
