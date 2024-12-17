import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { CreateAuthDto } from '../../common/dto/auth.dto/createAuthDto.dto';
import { LoginDto } from '../../common/dto/auth.dto/login.dto';
import { RefreshTokenDto } from 'src/common/dto/refresh-token.dto/refresh-token.dto';
import { RefreshTokenService } from '../refresh-token/application/refresh-token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  async login(@Body() logindto: LoginDto) {
    return this.authService.login(logindto);
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokenService.revokeRefreshToken(refreshTokenDto);
  }
  @Post('logout-all')
  async logoutAll(@Body() id: number) {
    return this.refreshTokenService.revokeAllRefreshTokens(id);
  }
}
