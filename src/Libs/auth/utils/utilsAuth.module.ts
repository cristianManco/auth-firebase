import { Module } from '@nestjs/common';
import { MoodleService } from 'src/modules/moodle/service/moodle.service';
import { HttpModule } from '@nestjs/axios';
import {
  MoodleSchema,
  moodleUser,
} from 'src/modules/moodle/entities/moodle.entity';
import { SignTokenService } from './services/signToken.service';
import { GetTokensService } from './services/getTokens.service';
import { WhiteListService } from './services/whiteList.service';
import { RolesService } from 'src/Libs/roles/services/roles.service';
import { ValidateTokenService } from './services/validateTokens.service';
import { RefreshTokenService } from './services/refresh.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Whitelist, WhitelistSchema } from '../entities/whiteList.entity';
import { Role, RoleSchema } from 'src/Libs/roles/entities/role.entity';
import { User, UserSchema } from 'src/modules/user/entities/user.entity';
import { LogModule } from 'src/modules/log/log.module';

const providers = [
  SignTokenService,
  GetTokensService,
  WhiteListService,
  RolesService,
  ValidateTokenService,
  RefreshTokenService,
  MoodleService,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Whitelist.name, schema: WhitelistSchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: moodleUser.name, schema: MoodleSchema },
    ]),
    HttpModule,
    LogModule,
  ],
  providers,
  exports: [...providers],
})
export class UtilsAuthModule {}
