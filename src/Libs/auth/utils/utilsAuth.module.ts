import { Module } from '@nestjs/common';
import { GetTokensService } from './services/getTokens.service';
import { WhiteListService } from './services/whiteList.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Whitelist, WhitelistSchema } from '../entities/whiteList.entity';
import { ValidateTokenService } from './services/validateTokens.service';
import { SignTokenService } from './services/signToken.service';
import { User, UserSchema } from 'src/modules/user/entities/user.entity';

const providers = [
  SignTokenService,
  GetTokensService,
  WhiteListService,
  ValidateTokenService,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Whitelist.name, schema: WhitelistSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers,
  exports: [...providers],
})
export class UtilsAuthModule {}
