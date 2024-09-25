import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './Libs/persistence/persistence.module';
import dbConfig from './Libs/persistence/db-config';
import { FirebaseModule } from './Libs/firebase/firebase.module';
import { UsersModule } from './modules/user/user.module';
import { AuthModule } from './Libs/auth/auth.module';
import { OtpModule } from './Libs/otp/otp.module';
import { SendEmailModule } from './Libs/email/email.module';
import { LogModule } from './modules/log/log.module';
import { LogInterceptor } from './modules/log/Interceptor/log.interceptor';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiKeyModule } from './modules/x-api-keys/api-key.module';
import { AuthGuard } from './Libs/Guards/x-api-key/api-key.guard';
import { JwtAuthGuard } from './Libs/Guards/jwt-auth/jwt-auth.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { RolesModule } from './Libs/roles/roles.module';
import { MoodleModule } from './modules/moodle/moodle.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [dbConfig],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    FirebaseModule,
    AuthModule,
    LogModule,
    UsersModule,
    ApiKeyModule,
    SendEmailModule,
    OtpModule,
    RolesModule,
    MoodleModule,
    PersistenceModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
