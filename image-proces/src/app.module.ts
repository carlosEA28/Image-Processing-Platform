import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infra/database/database.module';
import { AwsModule } from './infra/aws/aws.module';
import { ImagesModule } from './modules/images/images.module';
import { HealthModule } from './modules/health/health.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AwsModule,
    ImagesModule,
    HealthModule,
  ],
})
export class AppModule {}
