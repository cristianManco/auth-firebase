import { Cron, CronExpression } from '@nestjs/schedule';
import { MoodleService } from '../service/moodle.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MoodleSyncService {
  private readonly logger = new Logger(MoodleSyncService.name);

  constructor(private readonly moodleService: MoodleService) {}

  @Cron(CronExpression.EVERY_WEEK)
  async syncMoodleUsers() {
    this.logger.log('Cron job started: syncMoodleUsers');
    try {
      await this.moodleService.syncUsersWithCentinela();
      this.logger.log('Moodle users synced successfully');
    } catch (error) {
      this.logger.error('Error syncing Moodle users', error.stack);
      throw new HttpException(
        'Error syncing Moodle users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.log('Cron job finished: syncMoodleUsers');
  }
}
