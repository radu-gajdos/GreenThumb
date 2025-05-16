import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject('REDIS_CLIENT')
        private redis: Redis
    ) {}

    async seed() {
        await this.seedUsers();
    }
    
    async deleteFromRedis() {
        const keys = await this.redis.keys('*');
        if (keys.length > 0) {
            await this.redis.del(keys);
        }
    }

    async seedUsers() { 
        await this.userRepository.insert([
            {
                name: "Gajdos Radu",
                email: "radu@gmail.com",
                phone: "0777333111",
                twoFactorEnabled: false,
                password: await bcrypt.hash("Radu1234!", 10),
                emailVerified: new Date(),
            },
            { // id = 2
                name: "Adamescu Marius",
                email: "marius@gmail.com",
                phone: "0722111222",
                twoFactorEnabled: false,
                password: await bcrypt.hash("Marius1234!", 10),
                emailVerified: new Date(),
            },
        ]);
    }
}
