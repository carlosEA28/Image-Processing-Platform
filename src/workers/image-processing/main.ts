import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageProcessingWorkerModule } from './image-processing.module';
import { ImageProcessingWorker } from './image-processing.worker';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ImageProcessingWorkerModule);

  const configService = app.get(ConfigService);
  const worker = app.get(ImageProcessingWorker);

  const logger = new Logger('WorkerBootstrap');
  logger.log('Starting Image Processing Worker...');

  worker.start();

  const gracefulShutdown = async () => {
    logger.log('Shutting down worker...');
    worker.stop();
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  logger.log('Image Processing Worker is running');
}

bootstrap().catch((err) => {
  console.error('Failed to start worker', err);
  process.exit(1);
});
