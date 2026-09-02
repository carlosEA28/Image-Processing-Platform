import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageProcessingWorker } from './image-processing.worker';
import { ImagesModule } from '@/modules/images/images.module';
import { AwsModule } from '@/infra/aws/aws.module';
import { DatabaseModule } from '@/infra/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AwsModule,
    ImagesModule,
  ],
  providers: [ImageProcessingWorker],
})
export class ImageProcessingWorkerModule {}
