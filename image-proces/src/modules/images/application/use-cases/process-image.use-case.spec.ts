import { Test, TestingModule } from '@nestjs/testing';
import { ProcessImageUseCase } from './process-image.use-case';
import { IMAGE_REPOSITORY } from '../../domain/repositories/image.repository';
import { FILE_STORAGE } from '../../domain/interfaces/file-storage.interface';
import { ConfigService } from '@nestjs/config';
import { ImageStatus } from '../../domain/entities/image.entity';

jest.mock('sharp', () => {
  return jest.fn(() => ({
    webp: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed')),
  }));
});

describe('ProcessImageUseCase', () => {
  let useCase: ProcessImageUseCase;
  let mockImageRepository: any;
  let mockFileStorage: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockImageRepository = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
      updateProcessedKeys: jest.fn(),
    };

    mockFileStorage = {
      download: jest.fn(),
      upload: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessImageUseCase,
        { provide: IMAGE_REPOSITORY, useValue: mockImageRepository },
        { provide: FILE_STORAGE, useValue: mockFileStorage },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<ProcessImageUseCase>(ProcessImageUseCase);
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

    beforeEach(() => {
      mockImageRepository.findById.mockResolvedValue(mockImage);
      mockFileStorage.download.mockResolvedValue(Buffer.from('original'));
      mockFileStorage.upload.mockResolvedValue(undefined);
      mockImageRepository.updateProcessedKeys.mockResolvedValue(undefined);
      mockImageRepository.updateStatus.mockResolvedValue(undefined);
    });

    it('should process an image successfully', async () => {
      await useCase.execute(mockImage.id, mockImage.originalKey);

      expect(mockImageRepository.updateStatus).toHaveBeenCalledWith(
        mockImage.id,
        ImageStatus.PROCESSING,
      );
      expect(mockFileStorage.download).toHaveBeenCalledWith(
        mockImage.originalKey,
      );
      expect(mockFileStorage.upload).toHaveBeenCalledTimes(2);
      expect(mockImageRepository.updateProcessedKeys).toHaveBeenCalled();
      expect(mockImageRepository.updateStatus).toHaveBeenCalledWith(
        mockImage.id,
        ImageStatus.PROCESSED,
      );
    });

    it('should skip processing if already processed', async () => {
      const processedImage = { ...mockImage, status: ImageStatus.PROCESSED };
      mockImageRepository.findById.mockResolvedValue(processedImage);

      await useCase.execute(processedImage.id, processedImage.originalKey);

      expect(mockFileStorage.download).not.toHaveBeenCalled();
    });

    it('should set status to FAILED on error', async () => {
      mockFileStorage.download.mockRejectedValue(new Error('S3 error'));

      await expect(
        useCase.execute(mockImage.id, mockImage.originalKey),
      ).rejects.toThrow();

      expect(mockImageRepository.updateStatus).toHaveBeenCalledWith(
        mockImage.id,
        ImageStatus.FAILED,
      );
    });
  });
});
