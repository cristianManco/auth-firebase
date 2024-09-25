import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoodleSchema, moodleUser } from './entities/moodle.entity';
import { MoodleService } from './service/moodle.service';
import { MoodleController } from './controller/moodle.controller';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { MoodleSyncService } from './cronJobs/cronJobs.service';
import { AuthModule } from 'src/Libs/auth/auth.module';
import { UtilsAuthModule } from 'src/Libs/auth/utils/utilsAuth.module';
import { UsersModule } from '../user/user.module';
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: moodleUser.name, schema: MoodleSchema },
    ]),
    AuthModule,
    UtilsAuthModule,
    HttpModule,
    UsersModule,
    LogModule,
  ],
  providers: [MoodleSyncService, MoodleService],
  controllers: [MoodleController],
})
export class MoodleModule {}
