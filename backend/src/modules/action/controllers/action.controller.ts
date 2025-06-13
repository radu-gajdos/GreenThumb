import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, ClassSerializerInterceptor, Put, Query, Patch } from '@nestjs/common';
import { ActionService } from '../services/action.service';
import { CreateActionDto } from '../dto/create-action.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('actions')
export class ActionController {
    constructor(private readonly actionService: ActionService) { }

    @Post(':plotId')
    create(@Param('plotId') plotId: string, @Body() createActionDto: CreateActionDto) {
        return this.actionService.create(plotId, createActionDto);
    }

    @Get()
    findAll(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        if (startDate && endDate) {
            return this.actionService.getActionsByDateRange(
                new Date(startDate), 
                new Date(endDate)
            );
        }
        return this.actionService.findAll();
    }

    @Get('overdue')
    getOverdueActions() {
        return this.actionService.getOverdueActions();
    }

    @Get('plot/:plotId')
    findByPlot(@Param('plotId') plotId: string) {
        return this.actionService.findByPlot(plotId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.actionService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateActionDto: CreateActionDto) {
        return this.actionService.update(id, updateActionDto);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string, 
        @Body('status') status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
    ) {
        return this.actionService.updateStatus(id, status);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.actionService.remove(id);
    }
}