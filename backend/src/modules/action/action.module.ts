import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import { ActionService } from './services/action.service';
import { ActionController } from './controllers/action.controller';
import { Plot } from '../plot/entities/plot.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Action, Plot])],
    controllers: [ActionController],
    providers: [ActionService],
    exports: [ActionService],
})
export class ActionModule { }
