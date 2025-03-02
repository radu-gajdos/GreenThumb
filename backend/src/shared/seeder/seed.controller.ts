import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) {}

    @Get()
    public async seed(@Res() res: Response): Promise<void> {
        try {
            await this.seedService.seed();
            res.status(HttpStatus.OK).send({ message: 'Seeding completed successfully' });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Seeding failed', error: error.message });
        }
    };
}

