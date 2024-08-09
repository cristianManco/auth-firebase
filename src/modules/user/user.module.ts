import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './service/user.service';
import { UsersController } from './controller/user.controller';
import { User, UserSchema } from './entities/user.entity';
import { FirebaseModule } from 'src/Libs/firebase/firebase.module';
import { UtilsAuthModule } from 'src/Libs/auth/utils/utilsAuth.module';
import {
  Whitelist,
  WhitelistSchema,
} from 'src/Libs/auth/entities/whiteList.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Whitelist.name, schema: WhitelistSchema },
    ]),
    FirebaseModule,
    UtilsAuthModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
