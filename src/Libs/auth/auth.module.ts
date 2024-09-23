import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/at.strategy';
import { AuthController } from './controllers/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { WhiteListService } from './utils/services/whiteList.service';
import { Whitelist, WhitelistSchema } from './entities/whiteList.entity';
import { UsersModule } from 'src/modules/user/user.module';
import { jwtConstants } from '../constants/constant-jwt';
import { UtilsAuthModule } from './utils/utilsAuth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Whitelist.name, schema: WhitelistSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expires || '15m' },
    }),
    ConfigModule.forRoot(),
    UsersModule,
    UtilsAuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, WhiteListService, JwtStrategy],
  exports: [AuthService, MongooseModule],
})
export class AuthModule {}
