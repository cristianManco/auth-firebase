import { Module } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './entities/role.entity';
import { UtilsAuthModule } from '../auth/utils/utilsAuth.module';
import { JwtStrategy } from '../auth/strategies/at.strategy';
import { UsersModule } from 'src/modules/user/user.module';
import { LogModule } from 'src/modules/log/log.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    UtilsAuthModule,
    UsersModule,
    LogModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, JwtStrategy],
  exports: [],
})
export class RolesModule {}
