import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleService } from './drizzle/drizzle.service';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not defined');
        }
        const drizzleService = new DrizzleService(databaseUrl);
        return drizzleService.db;
      },
    },
    {
      provide: DrizzleService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not defined');
        }
        return new DrizzleService(databaseUrl);
      },
    },
  ],
  exports: [DRIZZLE, DrizzleService],
})
export class DatabaseModule {}
