import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { HealthCheckService } from './services/health-check.service';

@Module({
  controllers: [HealthController],
  providers: [HealthCheckService],
})
export class HealthModule {}
