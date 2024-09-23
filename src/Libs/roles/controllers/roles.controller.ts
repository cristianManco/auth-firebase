import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from '../entities/role.entity';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { RolesGuard } from 'src/Libs/Guards/guard-roles/roles.guard';
import { JwtAuthGuard } from 'src/Libs/Guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/Libs/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('roles')
@ApiHeader({
  name: 'x-api-key',
  description: 'API key needed to access this endpoint',
})
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Roles('ADMIN_CENTINELA')
  @Get()
  async getAllRoles() {
    return await this.rolesService.getAllRoles();
  }

  @Roles('ADMIN_CENTINELA')
  @Get(':id')
  async getRoleById(@Param('id') id: string): Promise<Role> {
    return await this.rolesService.getRoleById(id);
  }

  @Roles('ADMIN_CENTINELA')
  @Post('create')
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.rolesService.createRole(createRoleDto);
  }

  @Roles('ADMIN_CENTINELA')
  @Put('update/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return await this.rolesService.updateRole(id, updateRoleDto);
  }

  @Roles('ADMIN_CENTINELA')
  @Put('change-restriction/:id')
  async changeRestrictionRole(@Param('id') id: string): Promise<Role> {
    return await this.rolesService.changeRestrictionRole(id);
  }

  @Roles('ADMIN_CENTINELA')
  @Delete('delete/:id')
  async deleteRole(@Param('id') id: string): Promise<string> {
    return await this.rolesService.deleteRole(id);
  }
}
