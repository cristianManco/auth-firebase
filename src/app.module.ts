import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './Libs/persistence/persistence.module';
import dbConfig from './Libs/persistence/db-config';
import { FirebaseModule } from './Libs/firebase/firebase.module';
import { UsersModule } from './modules/user/user.module';
import { AuthModule } from './Libs/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [dbConfig],
      isGlobal: true,
    }),
    FirebaseModule,
    UsersModule,
    AuthModule,
    PersistenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
