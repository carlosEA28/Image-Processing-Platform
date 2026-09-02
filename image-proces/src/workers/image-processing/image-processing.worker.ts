import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsMessageQueue } from '@/infra/aws/sqs/sqs.service';
import { ProcessImageUseCase } from '@/modules/images/application/use-cases/process-image.use-case';
import { ImageProcessingMessage } from '@/modules/images/domain/interfaces/image-processing-message.interface';

@Injectable()
export class ImageProcessingWorker implements OnModuleDestroy {
  private readonly logger = new Logger(ImageProcessingWorker.name);
  private isRunning = false;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly sqsService: SqsMessageQueue,
    private readonly processImageUseCase: ProcessImageUseCase,
    private readonly configService: ConfigService,
  ) {}

  start(): void {
    if (this.isRunning) {
      this.logger.warn('Worker is already running');
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting image processing worker');
    this.poll();
  }

  stop(): void {
    this.isRunning = false;
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }
    this.logger.log('Image processing worker stopped');
  }

  onModuleDestroy() {
    this.stop();
  }

  private async poll(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      const queueUrl = await this.sqsService.ensureQueue('image-processing');

      const messages = await this.sqsService.receive(queueUrl);

      if (messages.length > 0) {
        this.logger.log(`Received ${messages.length} messages`);
      }

      for (const message of messages) {
        await this.processMessage(queueUrl, message);
      }
    } catch (error) {
      this.logger.error('Error polling messages', error);
    }

    this.scheduleNext();
  }

  private scheduleNext(): void {
    if (this.isRunning) {
      this.pollInterval = setTimeout(() => this.poll(), 1000);
    }
  }

  private async processMessage(
    queueUrl: string,
    message: { receiptHandle: string; body: Record<string, unknown> },
  ): Promise<void> {
    const body = message.body as unknown as ImageProcessingMessage;

    this.logger.log(`Processing message for image: ${body.imageId}`);

    try {
      await this.processImageUseCase.execute(
        body.imageId,
        body.originalKey,
      );

      await this.sqsService.delete(queueUrl, message.receiptHandle);

      this.logger.log(`Message processed and deleted: ${body.imageId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process message for image: ${body.imageId}`,
        error,
      );
    }
  }
}
