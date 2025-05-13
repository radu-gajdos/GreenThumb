import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, ClassSerializerInterceptor, SerializeOptions } from '@nestjs/common';
import { PlotService } from '../services/plot.service';
import { CreatePlotDto } from '../dto/create-plot.dto';
import { UpdatePlotDto } from '../dto/update-plot.dto';

@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
    groups: ['plot', 'relation'] // Must match entity groups
})
@Controller('plots')
export class PlotController {
    constructor(private readonly plotService: PlotService) {}

    @Post()
    create(@Body() createPlotDto: CreatePlotDto) {
        return this.plotService.create(createPlotDto);
    }

    @Get()
    findAll() {
        return this.plotService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.plotService.findOne(id);
    }

    @Put()
    update(@Body() updatePlotDto: UpdatePlotDto) {
        return this.plotService.update(updatePlotDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.plotService.remove(id);
    }
}
