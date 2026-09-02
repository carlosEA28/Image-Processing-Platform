import { Image } from '../entities/image.entity';

export const IMAGE_REPOSITORY = Symbol('IMAGE_REPOSITORY');

export interface ImageRepository {
  create(image: Image): Promise<Image>;
  findById(id: string): Promise<Image | null>;
  findAll(limit: number, offset: number): Promise<Image[]>;
  updateStatus(
    id: string,
    status: import('../entities/image.entity').ImageStatus,
  ): Promise<void>;
  updateProcessedKeys(
    id: string,
    processedKey: string,
    thumbnailKey: string,
  ): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}
