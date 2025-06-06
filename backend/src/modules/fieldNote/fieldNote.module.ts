import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldNote } from './entities/fieldNote.entity';
import { FieldNoteController } from './controllers/fieldNote.controller';
import { FieldNoteService } from './services/fieldNote.service';

@Module({
  imports: [TypeOrmModule.forFeature([FieldNote])],
  controllers: [FieldNoteController],
  providers: [FieldNoteService],
})
export class FieldNoteModule {}
