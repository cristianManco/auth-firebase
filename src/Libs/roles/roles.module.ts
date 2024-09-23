import { Module } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './entities/role.entity';
import { UtilsAuthModule } from '../auth/utils/utilsAuth.module';
import { JwtStrategy } from '../auth/strategies/at.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    UtilsAuthModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, JwtStrategy],
})
export class RolesModule {}
