import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './Libs/persistence/persistence.module';
import dbConfig from './Libs/persistence/db-config';
import { FirebaseModule } from './Libs/firebase/firebase.module';
import { UsersModule } from './modules/user/user.module';
import { AuthModule } from './Libs/auth/auth.module';
import { OtpModule } from './Libs/otp/otp.module';
import { SendEmailModule } from './Libs/email/email.module';

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
    PersistenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
