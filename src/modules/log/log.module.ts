import { Module } from '@nestjs/common';
import { LogService } from './service/log.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './entities/log.entity';
import { LogsController } from './controller/log.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }])],
  providers: [LogService],
  controllers: [LogsController],
  exports: [LogService],
})
export class LogModule {}
