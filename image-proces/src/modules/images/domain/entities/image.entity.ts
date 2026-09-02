export enum ImageStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export interface Image {
  id: string;
  originalFilename: string;
  originalKey: string;
  processedKey: string | null;
  thumbnailKey: string | null;
  mimeType: string;
  size: number;
  status: ImageStatus;
  createdAt: Date;
  updatedAt: Date;
}
