import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, ClassSerializerInterceptor, Put } from '@nestjs/common';
import { ActionService } from '../services/action.service';
import { CreateActionDto } from '../dto/create-action.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('actions')
export class ActionController {
    constructor(private readonly actionService: ActionService) { }

    @Post(':plotId')
    create(@Param('plotId') plotId: string, @Body() createActionDto: CreateActionDto) {
        return this.actionService.create(Number(plotId), createActionDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.actionService.findOne(Number(id));
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateActionDto: CreateActionDto) {
        return this.actionService.update(Number(id), updateActionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.actionService.remove(Number(id));
    }
}
