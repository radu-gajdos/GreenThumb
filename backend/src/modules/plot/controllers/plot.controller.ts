import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, ClassSerializerInterceptor, SerializeOptions } from '@nestjs/common';
import { PlotService } from '../services/plot.service';
import { CreatePlotDto } from '../dto/create-plot.dto';
import { UpdatePlotDto } from '../dto/update-plot.dto';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { AuthUserDto } from 'src/modules/auth/entities/auth-user.dto';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';

@Auth()
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
    groups: ['plot', 'relation'] // Must match entity groups
})
@Controller('plots')
export class PlotController {
    constructor(private readonly plotService: PlotService) {}

    @Post()
    create(@Body() createPlotDto: CreatePlotDto, @CurrentUser() user: AuthUserDto) {
        return this.plotService.create(createPlotDto, user);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUserDto) {
        return this.plotService.findAll(user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
        return this.plotService.findOne(id, user);
    }

    @Put()
    update(@Body() updatePlotDto: UpdatePlotDto, @CurrentUser() user: AuthUserDto) {
        return this.plotService.update(updatePlotDto, user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
        return this.plotService.remove(id, user);
    }
}
