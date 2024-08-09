import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'New role of the user',
    type: String,
  })
  role: string;
}
