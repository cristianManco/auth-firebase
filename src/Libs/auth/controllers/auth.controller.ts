import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginUserDto } from '../dtos/login.dto';
import { Tokens } from '../types/tokens.type';
import { LogoutUserDto } from '../dtos/logout.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateTokenDto } from '../dtos/validate-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Log in for a user' })
  @ApiBody({
    description: 'User data for log in',
    type: LoginUserDto,
    examples: {
      login: {
        summary: 'An example of a user log in',
        value: {
          firebaseToken: 'TOKEN OF FIRABASE',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The user obtains a token from the login.',
  })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<Tokens> {
    const token = await this.authService.login(loginUserDto);

    return { access_token: token.access_token };
  }

  @ApiOperation({ summary: 'Log out for a user' })
  @ApiBody({
    description: 'User data for log out',
    type: LogoutUserDto,
    examples: {
      logout: {
        summary: 'An example of a user log out',
        value: {
          token: 'JWT TOKEN',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The logout token is invalidated.' })
  @Post('logout')
  async logout(@Body() logoutUserDto: LogoutUserDto): Promise<string> {
    return await this.authService.logout(logoutUserDto);
  }

  @ApiOperation({ summary: 'Endpoint to validate a token.' })
  @ApiBody({
    description: 'Token to validate',
    examples: {
      token: {
        summary: 'Endpoint to validate',
        value: {
          token: 'JWT TOKEN',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message if the token is valid' })
  @Post('validate-token')
  async validateToken(
    @Body() validateTokenDto: ValidateTokenDto,
  ): Promise<object> {
    return await this.authService.validateToken(validateTokenDto.token);
  }
}
