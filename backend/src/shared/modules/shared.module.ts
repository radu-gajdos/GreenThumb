import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorGuard } from 'src/modules/auth/guards/two-factor.guard';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
    ],
    providers: [UserService, TwoFactorGuard],
    exports: [UserService]
})
export class SharedModule {}
