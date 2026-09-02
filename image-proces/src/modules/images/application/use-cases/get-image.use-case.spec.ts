import { Test, TestingModule } from '@nestjs/testing';
import { GetImageUseCase } from './get-image.use-case';
import { IMAGE_REPOSITORY } from '../../domain/repositories/image.repository';
import { NotFoundException } from '@nestjs/common';
import { ImageStatus } from '../../domain/entities/image.entity';

describe('GetImageUseCase', () => {
  let useCase: GetImageUseCase;
  let mockImageRepository: any;

  beforeEach(async () => {
    mockImageRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetImageUseCase,
        { provide: IMAGE_REPOSITORY, useValue: mockImageRepository },
      ],
    }).compile();

    useCase = module.get<GetImageUseCase>(GetImageUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockImage = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      originalFilename: 'test.jpg',
      originalKey: 'images/original/test.jpg',
      processedKey: null,
      thumbnailKey: null,
      mimeType: 'image/jpeg',
      size: 1024,
      status: ImageStatus.UPLOADED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return an image when found', async () => {
      mockImageRepository.findById.mockResolvedValue(mockImage);

      const result = await useCase.execute(mockImage.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockImage.id);
      expect(result.status).toBe(ImageStatus.UPLOADED);
    });

    it('should throw NotFoundException when image not found', async () => {
      mockImageRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
