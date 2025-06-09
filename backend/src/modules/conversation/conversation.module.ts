import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from './services/conversation.service';
import { ConversationController } from './controllers/conversation.controller';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Plot } from '../plot/entities/plot.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      Plot,
    ]),
    AiModule,
  ],
  providers: [ConversationService],
  controllers: [ConversationController],
  exports: [ConversationService],
})
export class ConversationModule {}