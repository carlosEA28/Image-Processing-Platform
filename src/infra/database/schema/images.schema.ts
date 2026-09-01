import {
  pgTable,
  uuid,
  varchar,
  bigint,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const imageStatusEnum = pgEnum('image_status', [
  'UPLOADED',
  'PROCESSING',
  'PROCESSED',
  'FAILED',
]);

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  originalKey: varchar('original_key', { length: 500 }).notNull(),
  processedKey: varchar('processed_key', { length: 500 }),
  thumbnailKey: varchar('thumbnail_key', { length: 500 }),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  status: imageStatusEnum('status').notNull().default('UPLOADED'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
