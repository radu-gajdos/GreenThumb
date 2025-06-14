import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldNote } from '../entities/fieldNote.entity';
import { AuthUserDto } from 'src/modules/auth/entities/auth-user.dto';
import { CreateFieldNoteDto } from '../dto/create-fieldNote.dto';
import { UpdateFieldNoteDto } from '../dto/update-fieldNote.dto';

@Injectable()
export class FieldNoteService {
  constructor(
    @InjectRepository(FieldNote)
    private readonly fieldNoteRepo: Repository<FieldNote>,
  ) { }

  async create(dto: CreateFieldNoteDto, user: AuthUserDto): Promise<FieldNote> {
    const note = this.fieldNoteRepo.create(dto);
    return this.fieldNoteRepo.save(note);
  }

  async findAllForPlot(plotId: string): Promise<FieldNote[]> {
    return this.fieldNoteRepo.find({ where: { plotId } });
  }

  async findAll(user: AuthUserDto): Promise<FieldNote[]> {
    return this.fieldNoteRepo.find({
      where: { plot: { ownerId: user.id } }, // Find notes where the plot belongs to the user
      relations: ['plot'], // Load the plot relation
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<FieldNote> {
    const note = await this.fieldNoteRepo.findOne({ where: { id } });
    if (!note) throw new NotFoundException('FieldNote not found');
    return note;
  }

  async update(dto: UpdateFieldNoteDto): Promise<FieldNote> {
    const note = await this.findOne(dto.id);
    Object.assign(note, dto);
    return this.fieldNoteRepo.save(note);
  }

  async remove(id: string): Promise<boolean> {
    const note = await this.findOne(id);
    if (!note) throw new NotFoundException('FieldNote not found');
    await this.fieldNoteRepo.remove(note);
    return true;
  }
}
