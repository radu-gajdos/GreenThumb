import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Body,
    Param,
    UseInterceptors,
    ClassSerializerInterceptor,
    SerializeOptions,
} from '@nestjs/common';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { AuthUserDto } from 'src/modules/auth/entities/auth-user.dto';
import { CreateFieldNoteDto } from '../dto/create-fieldNote.dto';
import { UpdateFieldNoteDto } from '../dto/update-fieldNote.dto';
import { FieldNoteService } from '../services/fieldNote.service';

@Auth()
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ groups: ['field_note'] })
@Controller('field-notes')
export class FieldNoteController {
    constructor(private readonly fieldNoteService: FieldNoteService) { }

    @Post()
    create(@Body() dto: CreateFieldNoteDto, @CurrentUser() user: AuthUserDto) {
        return this.fieldNoteService.create(dto, user);
    }

    @Get('plot/:plotId')
    findAllForPlot(@Param('plotId') plotId: string) {
        return this.fieldNoteService.findAllForPlot(plotId);
    }

    @Get()
    findAll(@CurrentUser() user: AuthUserDto) {
        return this.fieldNoteService.findAll(user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.fieldNoteService.findOne(id);
    }

    @Put()
    update(@Body() dto: UpdateFieldNoteDto) {
        return this.fieldNoteService.update(dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.fieldNoteService.remove(id);
    }
}
