import {
  Controller,
  Post,
  UseGuards,
  Request,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { RefreshTokenService } from './application/refresh-token.service';
import { RefreshTokenDto } from '../../common/dto/refresh-token.dto/refresh-token.dto';
import { RefreshTokenGuard } from '../auth/guards/refresh-auth/refresh.guard';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  // @Post('refresh')
  // async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
  //   console.log(refreshTokenDto);
  //   return this.refreshTokenService.refreshAccessToken(refreshTokenDto);
  // }
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    const refreshTokenDto = req.refresh_token;
    console.log(refreshTokenDto);
    if (!refreshTokenDto) {
      throw new UnauthorizedException('Refresh token not provided');
    }
    return this.refreshTokenService.refreshAccessToken(refreshTokenDto);
  }
  // @UseGuards(RefreshTokenGuard)

  // @Post('revoke')
  // async revoke(@Body() refreshTokenDto: RefreshTokenDto) {
  //   return this.refreshTokenService.revokeRefreshToken(refreshTokenDto);
  // }
  @UseGuards(RefreshTokenGuard)
  @Post('revoke')
  async revoke(@Request() req) {
    const refreshTokenDto = req.refresh_token;
    return this.refreshTokenService.revokeRefreshToken(refreshTokenDto);
  }
}
