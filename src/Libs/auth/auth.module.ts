import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/entities/user.entity';
import { jwtConstants } from '../constants/constant-jwt';
import { UtilsAuthModule } from './utils/utilsAuth.module';
import { ApiKeyModule } from 'src/modules/x-api-keys/api-key.module';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/at.strategy';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expires || '15m' },
    }),
    ConfigModule.forRoot(),
    UtilsAuthModule,
    ApiKeyModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
