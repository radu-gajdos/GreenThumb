import { Module } from '@nestjs/common';
import { UserService } from '../user/services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { TwoFactorService } from './services/two-factor-service';
import { TwoFactorController } from './controllers/two-factor.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
    ]),
  ],
  providers: [TwoFactorService, UserService],
  controllers: [TwoFactorController],
  exports: [TwoFactorService]
})
export class TwoFactorModule {}