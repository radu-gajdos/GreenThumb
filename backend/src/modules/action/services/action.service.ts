import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Action } from '../entities/action.entity';
import { CreateActionDto } from '../dto/create-action.dto';
import { Plot } from 'src/modules/plot/entities/plot.entity';

@Injectable()
export class ActionService {
    constructor(
        @InjectRepository(Action)
        private readonly actionRepository: Repository<Action>,
        @InjectRepository(Plot)
        private readonly plotRepository: Repository<Plot>,
    ) { }

    async create(plotId: number, input: CreateActionDto): Promise<Action> {
        const plot = await this.plotRepository.findOne({ where: { id: plotId } });

        if (!plot) throw new NotFoundException('Plot not found');
        if (!['fertilizing', 'harvesting', 'watering', 'planting', 'treatment'].includes(input.type)) {
            throw new BadRequestException('Invalid action type');
        }

        const action = this.actionRepository.create({ ...input, plot });
        return this.actionRepository.save(action);
    }

    async findOne(id: number): Promise<Action> {
        const action = await this.actionRepository.findOne({ where: { id } });
        if (!action) throw new NotFoundException();
        return action;
    }

    async update(id: number, input: CreateActionDto): Promise<Action> {
        const action = await this.findOne(id);

        if (!['fertilizing', 'harvesting', 'watering', 'planting', 'treatment'].includes(input.type)) {
            throw new BadRequestException('Invalid action type');
        }

        Object.assign(action, input);
        return this.actionRepository.save(action);
    }

    async remove(id: number): Promise<boolean> {
        const action = await this.actionRepository.findOne({ where: { id } });

        if (!action) throw new NotFoundException();

        await this.actionRepository.remove(action);
        return true;
    }
}
