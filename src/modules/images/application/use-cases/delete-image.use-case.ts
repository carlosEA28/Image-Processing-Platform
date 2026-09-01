import {
  Inject,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  IMAGE_REPOSITORY,
  ImageRepository,
} from '../../domain/repositories/image.repository';
import {
  FILE_STORAGE,
  FileStorage,
} from '../../domain/interfaces/file-storage.interface';

@Injectable()
export class DeleteImageUseCase {
  private readonly logger = new Logger(DeleteImageUseCase.name);

  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly imageRepository: ImageRepository,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`Deleting image: ${id}`);

    const image = await this.imageRepository.findById(id);

    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }

    const deletePromises: Promise<void>[] = [];

    deletePromises.push(this.fileStorage.delete(image.originalKey));

    if (image.processedKey) {
      deletePromises.push(this.fileStorage.delete(image.processedKey));
    }

    if (image.thumbnailKey) {
      deletePromises.push(this.fileStorage.delete(image.thumbnailKey));
    }

    await Promise.all(deletePromises);

    await this.imageRepository.delete(id);

    this.logger.log(`Image deleted successfully: ${id}`);
  }
}
