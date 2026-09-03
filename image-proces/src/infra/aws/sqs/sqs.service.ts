import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand,
  CreateQueueCommand,
} from '@aws-sdk/client-sqs';
import { MessageQueue } from '@/modules/images/domain/interfaces/message-queue.interface';

@Injectable()
export class SqsMessageQueue implements MessageQueue {
  private readonly sqsClient: SQSClient;
  private readonly logger = new Logger(SqsMessageQueue.name);
  private readonly endpoint: string;
  private resolvedQueueUrl: string | null = null;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get<string>('AWS_ENDPOINT') || '';
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';

    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION'),
      ...(this.endpoint && { endpoint: this.endpoint }),
      ...(accessKeyId && {
        credentials: {
          accessKeyId,
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
        },
      }),
    });
  }

  async ensureQueue(queueName: string): Promise<string> {
    if (this.resolvedQueueUrl) {
      return this.resolvedQueueUrl;
    }

    try {
      const result = await this.sqsClient.send(
        new GetQueueUrlCommand({ QueueName: queueName }),
      );
      this.resolvedQueueUrl = this.fixQueueUrl(result.QueueUrl!);
      this.logger.log(`Queue URL resolved: ${this.resolvedQueueUrl}`);
      return this.resolvedQueueUrl;
    } catch {
      this.logger.log(`Queue not found, creating: ${queueName}`);
      const result = await this.sqsClient.send(
        new CreateQueueCommand({ QueueName: queueName }),
      );
      this.resolvedQueueUrl = this.fixQueueUrl(result.QueueUrl!);
      this.logger.log(`Queue created: ${this.resolvedQueueUrl}`);
      return this.resolvedQueueUrl;
    }
  }

  private fixQueueUrl(queueUrl: string): string {
    if (!this.endpoint) {
      return queueUrl;
    }

    const endpointUrl = new URL(this.endpoint);
    const queueUrlObj = new URL(queueUrl);

    if (queueUrlObj.hostname === 'localhost' && endpointUrl.hostname !== 'localhost') {
      queueUrlObj.hostname = endpointUrl.hostname;
      return queueUrlObj.toString();
    }

    return queueUrl;
  }

  async send<T>(queueUrl: string, message: T): Promise<void> {
    this.logger.log(`Sending message to SQS: ${queueUrl}`);

    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
      }),
    );

    this.logger.log(`Message sent to SQS: ${queueUrl}`);
  }

  async receive(queueUrl: string): Promise<
    Array<{ receiptHandle: string; body: Record<string, unknown> }>
  > {
    const response = await this.sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      }),
    );

    if (!response.Messages) {
      return [];
    }

    return response.Messages.map((msg) => ({
      receiptHandle: msg.ReceiptHandle!,
      body: JSON.parse(msg.Body || '{}') as Record<string, unknown>,
    }));
  }

  async delete(queueUrl: string, receiptHandle: string): Promise<void> {
    await this.sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
  }
}
