import { Module } from '@nestjs/common';
import { PlotService } from './services/plot.service';
import { PlotController } from './controllers/plot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plot } from './entities/plot.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Plot])],
    controllers: [PlotController],
    providers: [PlotService],
})
export class PlotModule {}
