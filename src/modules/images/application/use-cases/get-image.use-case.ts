import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  IMAGE_REPOSITORY,
  ImageRepository,
} from '../../domain/repositories/image.repository';
import { ImageResponseDto } from '../dto/image-response.dto';

@Injectable()
export class GetImageUseCase {
  private readonly logger = new Logger(GetImageUseCase.name);

  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly imageRepository: ImageRepository,
  ) {}

  async execute(id: string): Promise<ImageResponseDto> {
    this.logger.log(`Getting image: ${id}`);

    const image = await this.imageRepository.findById(id);

    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }

    return ImageResponseDto.fromEntity(image);
  }
}
