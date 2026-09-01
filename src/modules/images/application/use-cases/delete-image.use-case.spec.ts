import { Test, TestingModule } from '@nestjs/testing';
import { DeleteImageUseCase } from './delete-image.use-case';
import { IMAGE_REPOSITORY } from '../../domain/repositories/image.repository';
import { FILE_STORAGE } from '../../domain/interfaces/file-storage.interface';
import { NotFoundException } from '@nestjs/common';
import { ImageStatus } from '../../domain/entities/image.entity';

describe('DeleteImageUseCase', () => {
  let useCase: DeleteImageUseCase;
  let mockImageRepository: any;
  let mockFileStorage: any;

  beforeEach(async () => {
    mockImageRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    mockFileStorage = {
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteImageUseCase,
        { provide: IMAGE_REPOSITORY, useValue: mockImageRepository },
        { provide: FILE_STORAGE, useValue: mockFileStorage },
      ],
    }).compile();

    useCase = module.get<DeleteImageUseCase>(DeleteImageUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockImage = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      originalFilename: 'test.jpg',
      originalKey: 'images/original/test.jpg',
      processedKey: 'images/processed/test.webp',
      thumbnailKey: 'images/thumbnails/test.webp',
      mimeType: 'image/jpeg',
      size: 1024,
      status: ImageStatus.PROCESSED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete an image successfully', async () => {
      mockImageRepository.findById.mockResolvedValue(mockImage);
      mockFileStorage.delete.mockResolvedValue(undefined);
      mockImageRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(mockImage.id);

      expect(mockFileStorage.delete).toHaveBeenCalledTimes(3);
      expect(mockImageRepository.delete).toHaveBeenCalledWith(mockImage.id);
    });

    it('should throw NotFoundException when image not found', async () => {
      mockImageRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete only original when no processed keys', async () => {
      const imageWithoutKeys = {
        ...mockImage,
        processedKey: null,
        thumbnailKey: null,
      };
      mockImageRepository.findById.mockResolvedValue(imageWithoutKeys);
      mockFileStorage.delete.mockResolvedValue(undefined);
      mockImageRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(imageWithoutKeys.id);

      expect(mockFileStorage.delete).toHaveBeenCalledTimes(1);
    });
  });
});
