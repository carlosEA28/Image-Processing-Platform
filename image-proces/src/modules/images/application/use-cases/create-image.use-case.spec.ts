import { Test, TestingModule } from '@nestjs/testing';
import { CreateImageUseCase } from './create-image.use-case';
import { IMAGE_REPOSITORY } from '../../domain/repositories/image.repository';
import { FILE_STORAGE } from '../../domain/interfaces/file-storage.interface';
import { MESSAGE_QUEUE } from '../../domain/interfaces/message-queue.interface';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { ImageStatus } from '../../domain/entities/image.entity';

describe('CreateImageUseCase', () => {
  let useCase: CreateImageUseCase;
  let mockImageRepository: any;
  let mockFileStorage: any;
  let mockMessageQueue: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockImageRepository = {
      create: jest.fn(),
    };

    mockFileStorage = {
      upload: jest.fn(),
    };

    mockMessageQueue = {
      send: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateImageUseCase,
        { provide: IMAGE_REPOSITORY, useValue: mockImageRepository },
        { provide: FILE_STORAGE, useValue: mockFileStorage },
        { provide: MESSAGE_QUEUE, useValue: mockMessageQueue },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<CreateImageUseCase>(CreateImageUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
      originalname: 'test.jpg',
      size: 1024,
    } as any;

    beforeEach(() => {
      mockConfigService.get.mockReturnValue('http://localhost:4566/queue');
      mockImageRepository.create.mockResolvedValue({});
      mockFileStorage.upload.mockResolvedValue(undefined);
      mockMessageQueue.send.mockResolvedValue(undefined);
    });

    it('should create an image successfully', async () => {
      const result = await useCase.execute(mockFile);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe(ImageStatus.UPLOADED);
      expect(mockImageRepository.create).toHaveBeenCalled();
      expect(mockFileStorage.upload).toHaveBeenCalled();
      expect(mockMessageQueue.send).toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is not provided', async () => {
      await expect(useCase.execute(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid mime type', async () => {
      const invalidFile = { ...mockFile, mimetype: 'image/gif' };
      await expect(useCase.execute(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for file too large', async () => {
      const largeFile = { ...mockFile, size: 20 * 1024 * 1024 };
      await expect(useCase.execute(largeFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
