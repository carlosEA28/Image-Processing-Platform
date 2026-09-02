import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IMAGE_REPOSITORY,
  ImageRepository,
} from '../../domain/repositories/image.repository';
import {
  ImageResponseDto,
  ListImagesResponseDto,
} from '../dto/image-response.dto';

@Injectable()
export class ListImagesUseCase {
  private readonly logger = new Logger(ListImagesUseCase.name);

  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly imageRepository: ImageRepository,
  ) {}

  async execute(
    limit: number = 10,
    offset: number = 0,
  ): Promise<ListImagesResponseDto> {
    this.logger.log(`Listing images: limit=${limit}, offset=${offset}`);

    const [images, total] = await Promise.all([
      this.imageRepository.findAll(limit, offset),
      this.imageRepository.count(),
    ]);

    const imageDtos = images.map(ImageResponseDto.fromEntity);

    return new ListImagesResponseDto(imageDtos, total);
  }
}
