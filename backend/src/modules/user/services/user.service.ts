import { Injectable, NotFoundException, ConflictException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Redis } from 'ioredis';
import { isNotEmpty } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('REDIS_CLIENT')
    private redis: Redis
  ) {}

  async create(createUserDto: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'phone']
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({where: { id }});

    if(!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.userRepository.findOne({where: { email }});
    if(!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
      updateUserDto.passwordChangedAt = new Date();
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, {
      lastLogin: new Date()
    });
  }

  async verifyEmail(id: number): Promise<void> {
    await this.userRepository.update(id, {
      emailVerified: new Date()
    });
  }

  async getUserForGuards(id: number): Promise<{
      id: number, 
      passwordResetCount: number,
      twoFactorEnabled: boolean, 
  }> {

    const cachedUser = await this.redis.get(`userForGuards:${id}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'twoFactorEnabled', 'passwordResetCount']
    });

    if(!user) throw new NotFoundException('User not found');

    const userForGuards = {
        id: user.id,
        passwordResetCount: user.passwordResetCount,
        twoFactorEnabled: user.twoFactorEnabled,
    };

    await this.redis.set(
        `userForGuards:${id}`,
        JSON.stringify(userForGuards),
        // @ts-ignore
        'EX',
        process.env.REDIS_USER_GUARD_CACHE_TTL
    );

    return userForGuards;
  }

  async updateWithRedis(id: number, updateUserDto: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if(updateUserDto.password){
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
      updateUserDto.passwordResetCount = user.passwordResetCount + 1;
      updateUserDto.passwordChangedAt = new Date();
    }
    await this.redis.del(`userForGuards:${id}`);
    return this.userRepository.save({...user, ...updateUserDto});
  }
}

