import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3FileStorage } from './s3.service';
import { FILE_STORAGE } from '@/modules/images/domain/interfaces/file-storage.interface';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FILE_STORAGE,
      useClass: S3FileStorage,
    },
    S3FileStorage,
  ],
  exports: [FILE_STORAGE, S3FileStorage],
})
export class S3Module {}
