import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiController } from './controllers/ai.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plot } from '../plot/entities/plot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plot]),
  ],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule { }
