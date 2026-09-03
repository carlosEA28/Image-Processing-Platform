import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { FileStorage } from '@/modules/images/domain/interfaces/file-storage.interface';
import { Readable } from 'stream';

@Injectable()
export class S3FileStorage implements FileStorage, OnModuleInit {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(S3FileStorage.name);

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('AWS_ENDPOINT');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      ...(endpoint && { endpoint, forcePathStyle: true }),
      ...(accessKeyId && {
        credentials: {
          accessKeyId,
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
        },
      }),
    });
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket(): Promise<void> {
    if (!this.bucket) {
      this.logger.warn('No S3 bucket configured');
      return;
    }

    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucket }),
      );
      this.logger.log(`S3 bucket exists: ${this.bucket}`);
    } catch {
      this.logger.log(`Creating S3 bucket: ${this.bucket}`);
      try {
        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: this.bucket }),
        );
        this.logger.log(`S3 bucket created: ${this.bucket}`);
      } catch (error) {
        this.logger.error(`Failed to create S3 bucket: ${this.bucket}`, error);
      }
    }
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<void> {
    this.logger.log(`Uploading file to S3: ${key} (${body.length} bytes)`);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    this.logger.log(`File uploaded to S3: ${key}`);
  }

  async download(key: string): Promise<Buffer> {
    this.logger.log(`Downloading file from S3: ${key}`);

    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    const stream = response.Body;
    if (!stream) {
      throw new Error(`No body returned for key: ${key}`);
    }

    const readableStream = stream as Readable;

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (chunk) => {
        if (chunk instanceof Buffer) {
          chunks.push(chunk);
        } else {
          chunks.push(Buffer.from(chunk));
        }
      });
      readableStream.on('end', () => resolve(Buffer.concat(chunks)));
      readableStream.on('error', reject);
    });

    this.logger.log(`File downloaded from S3: ${key} (${buffer.length} bytes)`);
    this.logger.log(`First 16 bytes: ${buffer.subarray(0, 16).toString('hex')}`);

    return buffer;
  }

  async delete(key: string): Promise<void> {
    this.logger.log(`Deleting file from S3: ${key}`);

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    this.logger.log(`File deleted from S3: ${key}`);
  }
}
