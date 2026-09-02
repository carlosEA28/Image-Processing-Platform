import { SQSClient } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

export const createSQSClient = (configService: ConfigService): SQSClient => {
  return new SQSClient({
    region: configService.get<string>('AWS_REGION'),
    credentials: {
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') || '',
      secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
    },
  });
};
