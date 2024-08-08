import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from '../services/otp.service';
import { CreateOtpDto } from '../dtos/create-otp.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateOtpDto } from '../dtos/update-otp.dto';

@ApiTags('otp')
@Controller('otp')
export class OtpCOntroller {
  constructor(private readonly otpService: OtpService) {}

  @ApiOperation({ summary: 'Endpoint to create an OTP code.' })
  @ApiBody({
    description: 'ID of user to create an OTP code',
    type: CreateOtpDto,
    examples: {
      token: {
        summary: 'Enter the user ID to assign the otp',
        value: {
          id_user: 'You user id',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The otp code has been created' })
  @Post('/create')
  async createOtpCode(@Body() id: CreateOtpDto) {
    return await this.otpService.createOtpCode(id);
  }

  @ApiOperation({ summary: 'Endpoint to validate a OTP code.' })
  @ApiBody({
    description: 'id and otp to validate',
    type: UpdateOtpDto,
    examples: {
      token: {
        summary: 'Data required to validate the OTP code',
        value: {
          id: 'ID user',
          code: 231000,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message if the OTP is valid' })
  @Post('/validate')
  async validateOtpCode(@Body() updateOtpDto: UpdateOtpDto) {
    return await this.otpService.validateOtpCode(
      updateOtpDto.id,
      updateOtpDto.code,
    );
  }
}
