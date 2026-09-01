import { Injectable, Logger } from '@nestjs/common';
import { eq, desc, sql } from 'drizzle-orm';
import { DRIZZLE } from '@/infra/database/database.module';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { images } from '@/infra/database/schema';
import {
  ImageRepository,
} from '@/modules/images/domain/repositories/image.repository';
import {
  Image,
  ImageStatus,
} from '@/modules/images/domain/entities/image.entity';
import * as schema from '@/infra/database/schema';

@Injectable()
export class DrizzleImageRepository implements ImageRepository {
  private readonly logger = new Logger(DrizzleImageRepository.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(image: Image): Promise<Image> {
    this.logger.log(`Creating image record: ${image.id}`);

    const [created] = await this.db
      .insert(images)
      .values({
        id: image.id,
        originalFilename: image.originalFilename,
        originalKey: image.originalKey,
        processedKey: image.processedKey,
        thumbnailKey: image.thumbnailKey,
        mimeType: image.mimeType,
        size: image.size,
        status: image.status,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
      })
      .returning();

    return this.toEntity(created);
  }

  async findById(id: string): Promise<Image | null> {
    this.logger.log(`Finding image by id: ${id}`);

    const [found] = await this.db
      .select()
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    if (!found) {
      return null;
    }

    return this.toEntity(found);
  }

  async findAll(limit: number, offset: number): Promise<Image[]> {
    this.logger.log(`Finding all images: limit=${limit}, offset=${offset}`);

    const rows = await this.db
      .select()
      .from(images)
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map(this.toEntity);
  }

  async updateStatus(id: string, status: ImageStatus): Promise<void> {
    this.logger.log(`Updating image status: ${id} -> ${status}`);

    await this.db
      .update(images)
      .set({ status, updatedAt: new Date() })
      .where(eq(images.id, id));
  }

  async updateProcessedKeys(
    id: string,
    processedKey: string,
    thumbnailKey: string,
  ): Promise<void> {
    this.logger.log(`Updating processed keys for image: ${id}`);

    await this.db
      .update(images)
      .set({
        processedKey,
        thumbnailKey,
        updatedAt: new Date(),
      })
      .where(eq(images.id, id));
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting image: ${id}`);

    await this.db.delete(images).where(eq(images.id, id));
  }

  async count(): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(images);

    return Number(result.count);
  }

  private toEntity(row: typeof images.$inferSelect): Image {
    return {
      id: row.id,
      originalFilename: row.originalFilename,
      originalKey: row.originalKey,
      processedKey: row.processedKey,
      thumbnailKey: row.thumbnailKey,
      mimeType: row.mimeType,
      size: row.size,
      status: row.status as ImageStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
