export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface FileStorage {
  upload(key: string, body: Buffer, contentType: string): Promise<void>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
