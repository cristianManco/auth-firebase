import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './Libs/persistence/persistence.module';
import dbConfig from './Libs/persistence/db-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [dbConfig],
      isGlobal: true,
    }),
    PersistenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
