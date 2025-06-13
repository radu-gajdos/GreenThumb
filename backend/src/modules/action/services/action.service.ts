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

    async create(plotId: string, input: CreateActionDto): Promise<Action> {
        const plot = await this.plotRepository.findOne({ where: { id: plotId } });

        if (!plot) throw new NotFoundException('Plot not found');
        
        // Extended action types to match frontend
        const validActionTypes = [
            'fertilizing', 
            'harvesting', 
            'watering', 
            'planting', 
            'treatment',
            'soil_reading',
            'maintenance',
            'pest_control',
            'pruning',
            'weeding'
        ];
        
        if (!validActionTypes.includes(input.type)) {
            throw new BadRequestException(`Invalid action type. Valid types: ${validActionTypes.join(', ')}`);
        }

        // Set default status if not provided
        const actionData = {
            ...input,
            plotId,
            status: input.status || 'planned'
        };

        const action = this.actionRepository.create(actionData);
        return this.actionRepository.save(action);
    }

    async findOne(id: string): Promise<Action> {
        const action = await this.actionRepository.findOne({ 
            where: { id },
            relations: ['plot'] // Include plot relationship for frontend
        });
        if (!action) throw new NotFoundException('Action not found');
        return action;
    }

    async findByPlot(plotId: string): Promise<Action[]> {
        return this.actionRepository.find({
            where: { plotId },
            relations: ['plot'],
            order: { date: 'ASC' }
        });
    }

    async findAll(): Promise<Action[]> {
        return this.actionRepository.find({
            relations: ['plot'],
            order: { date: 'ASC' }
        });
    }

    async update(id: string, input: CreateActionDto): Promise<Action> {
        const action = await this.findOne(id);

        const validActionTypes = [
            'fertilizing', 
            'harvesting', 
            'watering', 
            'planting', 
            'treatment',
            'soil_reading',
            'maintenance',
            'pest_control',
            'pruning',
            'weeding'
        ];

        if (input.type && !validActionTypes.includes(input.type)) {
            throw new BadRequestException(`Invalid action type. Valid types: ${validActionTypes.join(', ')}`);
        }

        Object.assign(action, input);
        return this.actionRepository.save(action);
    }

    async updateStatus(id: string, status: 'planned' | 'in_progress' | 'completed' | 'cancelled'): Promise<Action> {
        const action = await this.findOne(id);
        action.status = status;
        return this.actionRepository.save(action);
    }

    async remove(id: string): Promise<boolean> {
        const action = await this.actionRepository.findOne({ where: { id } });

        if (!action) throw new NotFoundException('Action not found');

        await this.actionRepository.remove(action);
        return true;
    }

    async getActionsByDateRange(startDate: Date, endDate: Date): Promise<Action[]> {
        return this.actionRepository
            .createQueryBuilder('action')
            .leftJoinAndSelect('action.plot', 'plot')
            .where('action.date >= :startDate', { startDate })
            .andWhere('action.date <= :endDate', { endDate })
            .orderBy('action.date', 'ASC')
            .getMany();
    }

    async getOverdueActions(): Promise<Action[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.actionRepository
            .createQueryBuilder('action')
            .leftJoinAndSelect('action.plot', 'plot')
            .where('action.date < :today', { today })
            .andWhere('action.status != :completedStatus', { completedStatus: 'completed' })
            .orderBy('action.date', 'ASC')
            .getMany();
    }
}