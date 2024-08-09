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
import { LogIterceptor } from './modules/log/Interceptor/log.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [dbConfig],
      isGlobal: true,
    }),
    FirebaseModule,
    AuthModule,
    UsersModule,
    OtpModule,
    SendEmailModule,
    LogModule,
    PersistenceModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LogIterceptor,
    },
  ],
})
export class AppModule {}
