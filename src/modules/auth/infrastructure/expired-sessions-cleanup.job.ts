import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JwtRedisAuthAdapter } from './jwt-redis-auth.adapter';

@Injectable()
export class ExpiredSessionsCleanupJob implements OnModuleInit {
  private readonly logger = new Logger(ExpiredSessionsCleanupJob.name);

  constructor(private readonly auth: JwtRedisAuthAdapter) {}

  async onModuleInit(): Promise<void> {
    await this.cleanupExpiredSessions();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions(): Promise<void> {
    let deletedSessions = 0;
    const now = Date.now() / 1000;

    try {
      for await (const sessionId of this.auth.scanSessionIds()) {
        if (
          !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            sessionId,
          )
        ) {
          continue;
        }

        const value = await this.auth.getSession(sessionId);
        if (!value) continue;

        let session: unknown;
        try {
          session = JSON.parse(value);
        } catch {
          continue;
        }

        if (
          session === null ||
          typeof session !== 'object' ||
          !('refreshToken' in session) ||
          typeof session.refreshToken !== 'string'
        ) {
          continue;
        }

        let payload: unknown;
        try {
          payload = this.auth.verifyTokenIgnoringExpiration(
            session.refreshToken,
          );
        } catch {
          continue;
        }

        if (
          payload === null ||
          typeof payload !== 'object' ||
          !('exp' in payload) ||
          typeof payload.exp !== 'number' ||
          payload.exp > now
        ) {
          continue;
        }

        if (await this.auth.deleteSessionIfUnchanged(sessionId, value)) {
          deletedSessions++;
        }
      }

      this.logger.log(`Removed ${deletedSessions} expired sessions from Redis`);
    } catch (error) {
      this.logger.error(
        'Failed to clean up expired sessions from Redis',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
