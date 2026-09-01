import { Module } from '@nestjs/common';
import { ImagesController } from './presentation/controllers/images.controller';
import { CreateImageUseCase } from './application/use-cases/create-image.use-case';
import { GetImageUseCase } from './application/use-cases/get-image.use-case';
import { ListImagesUseCase } from './application/use-cases/list-images.use-case';
import { DeleteImageUseCase } from './application/use-cases/delete-image.use-case';
import { ProcessImageUseCase } from './application/use-cases/process-image.use-case';
import { DrizzleImageRepository } from './infrastructure/repositories/drizzle-image.repository';
import { IMAGE_REPOSITORY } from './domain/repositories/image.repository';

@Module({
  controllers: [ImagesController],
  providers: [
    {
      provide: IMAGE_REPOSITORY,
      useClass: DrizzleImageRepository,
    },
    CreateImageUseCase,
    GetImageUseCase,
    ListImagesUseCase,
    DeleteImageUseCase,
    ProcessImageUseCase,
  ],
  exports: [
    IMAGE_REPOSITORY,
    CreateImageUseCase,
    GetImageUseCase,
    ListImagesUseCase,
    DeleteImageUseCase,
    ProcessImageUseCase,
  ],
})
export class ImagesModule {}
