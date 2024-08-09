import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './Libs/persistence/persistence.module';
import dbConfig from './Libs/persistence/db-config';
import { FirebaseModule } from './Libs/firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [dbConfig],
      isGlobal: true,
    }),
    FirebaseModule,
    PersistenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
