import { IsBoolean, IsObject } from 'class-validator';

export class ValidateRoleResponse {
  @IsObject()
  data: object;

  @IsBoolean()
  isValidRole: boolean;
}
