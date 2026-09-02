import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsMessageQueue } from './sqs.service';
import { MESSAGE_QUEUE } from '@/modules/images/domain/interfaces/message-queue.interface';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MESSAGE_QUEUE,
      useClass: SqsMessageQueue,
    },
    SqsMessageQueue,
  ],
  exports: [MESSAGE_QUEUE, SqsMessageQueue],
})
export class SqsModule {}
