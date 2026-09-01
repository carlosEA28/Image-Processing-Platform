import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IMAGE_REPOSITORY,
  ImageRepository,
} from '../../domain/repositories/image.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '../../domain/interfaces/file-storage.interface';
import { ImageStatus } from '../../domain/entities/image.entity';
import sharp from 'sharp';

@Injectable()
export class ProcessImageUseCase {
  private readonly logger = new Logger(ProcessImageUseCase.name);

  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly imageRepository: ImageRepository,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    imageId: string,
    originalKey: string,
  ): Promise<void> {
    this.logger.log(`Processing image: ${imageId}`);

    const image = await this.imageRepository.findById(imageId);

    if (!image) {
      this.logger.error(`Image not found: ${imageId}`);
      throw new Error(`Image not found: ${imageId}`);
    }

    if (image.status === ImageStatus.PROCESSED) {
      this.logger.log(`Image already processed: ${imageId}`);
      return;
    }

    await this.imageRepository.updateStatus(imageId, ImageStatus.PROCESSING);

    try {
      this.logger.log(`Downloading image from S3: ${originalKey}`);
      const imageBuffer = await this.fileStorage.download(originalKey);

      this.logger.log(`Processing image with Sharp: ${imageId}`);

      const processedKey = `images/processed/${imageId}.webp`;
      const thumbnailKey = `images/thumbnails/${imageId}.webp`;

      const processedBuffer = await sharp(imageBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      this.logger.log(`Uploading processed images to S3: ${imageId}`);

      await Promise.all([
        this.fileStorage.upload(processedKey, processedBuffer, 'image/webp'),
        this.fileStorage.upload(thumbnailKey, thumbnailBuffer, 'image/webp'),
      ]);

      await this.imageRepository.updateProcessedKeys(
        imageId,
        processedKey,
        thumbnailKey,
      );

      await this.imageRepository.updateStatus(imageId, ImageStatus.PROCESSED);

      this.logger.log(`Image processed successfully: ${imageId}`);
    } catch (error) {
      this.logger.error(`Failed to process image: ${imageId}`, error);
      await this.imageRepository.updateStatus(imageId, ImageStatus.FAILED);
      throw error;
    }
  }
}
