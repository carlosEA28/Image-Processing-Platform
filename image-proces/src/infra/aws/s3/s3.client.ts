import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const createS3Client = (configService: ConfigService): S3Client => {
  const accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID') || '';

  return new S3Client({
    region: configService.get<string>('AWS_REGION'),
    ...(accessKeyId && {
      credentials: {
        accessKeyId,
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    }),
  });
};
