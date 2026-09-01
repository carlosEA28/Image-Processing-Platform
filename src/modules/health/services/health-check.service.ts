import { Injectable, Logger } from '@nestjs/common';
import { DRIZZLE } from '@/infra/database/database.module';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/infra/database/schema';
import { sql } from 'drizzle-orm';

export interface HealthStatus {
  status: string;
  timestamp: string;
  checks: {
    api: string;
    database: string;
  };
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async check(): Promise<HealthStatus> {
    const databaseStatus = await this.checkDatabase();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        api: 'ok',
        database: databaseStatus,
      },
    };
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return 'ok';
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return 'error';
    }
  }
}
