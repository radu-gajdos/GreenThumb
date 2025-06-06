import { Module, MiddlewareConsumer, NestModule, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// Configs
import configuration from 'src/config/configuration';
import databaseConfig from 'src/config/database.config';
import jwtConfig from 'src/config/jwt.config';

// Core
import { LoggingInterceptor } from 'src/core/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/core/interceptors/transform.interceptor';
import { HttpExceptionFilter } from 'src/core/filters/http-exception.filter';

// Modules
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/user/user.module';
import { TwoFactorModule } from './modules/two-factor/two-factor.module';
import redisConfig from './config/redis.config';
import mailConfig from './config/mail.config';
import { RedisModule } from './modules/redis/redis.module';
import { SeedModule } from './shared/seeder/seed.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ValidatorModule } from './shared/validators/validator.module';
import { DataSource } from 'typeorm';
import { setDataSource } from './shared/decorators/isEntityExistConstraint';
import { SharedModule } from './shared/modules/shared.module';
import { PlotModule } from './modules/plot/plot.module';
import { ActionModule } from './modules/action/action.module';
import { AiModule } from './modules/ai/ai.module';
import { FieldNoteModule } from './modules/fieldNote/fieldNote.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig, jwtConfig, redisConfig, mailConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        dropSchema: configService.get('database.dropSchema'),
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    RedisModule,
    ScheduleModule.forRoot(),
    // Feature modules
    AuthModule,
    UserModule,
    SeedModule,
    TwoFactorModule,
    ValidatorModule,
    SharedModule,
    PlotModule,
    ActionModule,
    AiModule,
    FieldNoteModule
  ],
  providers: [
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    setDataSource(this.dataSource);
  }
}
