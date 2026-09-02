import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsDate } from 'class-validator';
import { ImageStatus } from '../../domain/entities/image.entity';

export class ImageResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  originalFilename: string;

  @IsString()
  @IsNotEmpty()
  status: ImageStatus;

  @IsString()
  @IsOptional()
  originalKey?: string;

  @IsString()
  @IsOptional()
  processedKey?: string;

  @IsString()
  @IsOptional()
  thumbnailKey?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsOptional()
  size?: number;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;

  static fromEntity(entity: {
    id: string;
    originalFilename: string;
    status: ImageStatus;
    originalKey: string;
    processedKey: string | null;
    thumbnailKey: string | null;
    mimeType: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
  }): ImageResponseDto {
    const dto = new ImageResponseDto();
    dto.id = entity.id;
    dto.originalFilename = entity.originalFilename;
    dto.status = entity.status;
    dto.originalKey = entity.originalKey;
    dto.processedKey = entity.processedKey || undefined;
    dto.thumbnailKey = entity.thumbnailKey || undefined;
    dto.mimeType = entity.mimeType;
    dto.size = entity.size;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class CreateImageResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(ImageStatus)
  @IsNotEmpty()
  status: ImageStatus;

  constructor(id: string, status: ImageStatus) {
    this.id = id;
    this.status = status;
  }
}

export class ListImagesResponseDto {
  images: ImageResponseDto[];
  total: number;

  constructor(images: ImageResponseDto[], total: number) {
    this.images = images;
    this.total = total;
  }
}
