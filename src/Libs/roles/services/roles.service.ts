import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from '../entities/role.entity';
import { Model } from 'mongoose';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { ValidateRoleResponse } from '../dtos/validate-role-response.dto';
import { isMongoId } from 'class-validator';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private userRole: Model<RoleDocument>) {}

  async getAllRoles(): Promise<Role[]> {
    try {
      const roles = await this.userRole.find().exec();

      if (!roles)
        throw new HttpException(
          'Error when bringing the roles',
          HttpStatus.BAD_REQUEST,
        );

      return roles;
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRoleById(id: string): Promise<Role> {
    try {
      if (!isMongoId(id))
        throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);

      const role = await this.userRole.findById(id).exec();

      if (!role)
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);

      return role;
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const newRole = new this.userRole(createRoleDto);
      return await newRole.save();
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      if (!isMongoId(id))
        throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);

      const updatedRole = await this.userRole.findByIdAndUpdate(
        id,
        { ...updateRoleDto, updatedAt: new Date() },
        { new: true },
      );

      if (!updatedRole)
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);

      return updatedRole;
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changeRestrictionRole(id: string): Promise<Role> {
    try {
      if (!isMongoId(id))
        throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);

      const role = await this.getRoleById(id);

      if (!role)
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);

      const switchRole = role.restricted ? false : true;

      const updatedRole = await this.userRole.findByIdAndUpdate(
        id,
        { restricted: switchRole },
        { new: true },
      );

      if (!updatedRole)
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);

      return updatedRole;
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteRole(id: string): Promise<string> {
    if (!isMongoId(id))
      throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);

    try {
      const roleDeleted = await this.userRole.findByIdAndDelete(id);

      if (!roleDeleted) throw new NotFoundException('Role not exist');

      return 'Role deleted successfully!';
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateRoleExistence(roles: string[]): Promise<ValidateRoleResponse> {
    try {
      const responseData = { data: null, isValidRole: false };

      for (let i = 0; i < roles.length; i++) {
        const role = await this.userRole.findOne({ code: roles[i] }).exec();

        if (role) {
          responseData.data = role;
          responseData.isValidRole = true;
        }
      }

      return responseData;
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
