import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Plot } from '../entities/plot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlotDto } from '../dto/create-plot.dto';
import { UpdatePlotDto } from '../dto/update-plot.dto';
import { AuthUserDto } from 'src/modules/auth/entities/auth-user.dto';
@Injectable()
export class PlotService {
  constructor(
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
  ) {}

  async create(input: CreatePlotDto, user: AuthUserDto): Promise<Plot> {
    const plot = this.plotRepository.create({ ...input, ownerId: user.id });
    return this.plotRepository.save(plot);
  }

  async findAll(user: AuthUserDto): Promise<Plot[]> {
    return this.plotRepository.find({where: {ownerId: user.id}, relations: ['actions'] });
  }

  async findOne(id: string, user: AuthUserDto): Promise<Plot> {
    const plot = await this.plotRepository.findOne({
      where: { id, ownerId: user.id },
      relations: ['actions', 'owner'],
    });
    if (!plot) throw new NotFoundException();
    return plot;
  }

  async update(input: UpdatePlotDto, user: AuthUserDto): Promise<Plot> {
    const plot = await this.findOne(input.id, user);
    Object.assign(plot, input);
    return this.plotRepository.save(plot);
  }

  async remove(id: string, user: AuthUserDto): Promise<boolean> {
    const plot = await this.findOne(id, user);
    await this.plotRepository.remove(plot);
    return true;
  }
}
