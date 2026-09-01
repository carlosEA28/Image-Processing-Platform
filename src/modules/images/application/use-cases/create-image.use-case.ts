import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  Image,
  ImageStatus,
} from '../../domain/entities/image.entity';
import {
  IMAGE_REPOSITORY,
  ImageRepository,
} from '../../domain/repositories/image.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '../../domain/interfaces/file-storage.interface';
import {
  MESSAGE_QUEUE,
  MessageQueue,
} from '../../domain/interfaces/message-queue.interface';
import { ImageProcessingMessage } from '../../domain/interfaces/image-processing-message.interface';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class CreateImageUseCase {
  private readonly logger = new Logger(CreateImageUseCase.name);

  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly imageRepository: ImageRepository,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
    @Inject(MESSAGE_QUEUE)
    private readonly messageQueue: MessageQueue,
  ) {}

  async execute(
    file: Express.Multer.File,
  ): Promise<{ id: string; status: ImageStatus }> {
    this.validateFile(file);

    const imageId = uuidv4();
    const originalKey = `images/original/${imageId}.${this.getExtension(file.mimetype)}`;

    const image: Image = {
      id: imageId,
      originalFilename: file.originalname,
      originalKey,
      processedKey: null,
      thumbnailKey: null,
      mimeType: file.mimetype,
      size: file.size,
      status: ImageStatus.UPLOADED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.log(`Creating image record: ${imageId}`);
    await this.imageRepository.create(image);

    this.logger.log(`Uploading original image to S3: ${originalKey}`);
    await this.fileStorage.upload(originalKey, file.buffer, file.mimetype);

    const queueUrl = await this.messageQueue.ensureQueue('image-processing');

    const message: ImageProcessingMessage = {
      imageId,
      originalKey,
    };

    this.logger.log(`Sending processing message to SQS for image: ${imageId}`);
    await this.messageQueue.send(queueUrl, message);

    this.logger.log(`Image uploaded successfully: ${imageId}`);
    return { id: imageId, status: ImageStatus.UPLOADED };
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  private getExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return extensions[mimeType] || 'jpg';
  }
}
