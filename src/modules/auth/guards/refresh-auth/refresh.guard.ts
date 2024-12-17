import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from 'src/modules/refresh-token/application/refresh-token.service';

@Injectable()
export class RefreshTokenGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.headers['authorization']?.split(' ')[1];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      const isRevoked = await this.refreshTokenService.isRefreshTokenValid({
        token: refreshToken,
      });
      if (!isRevoked) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      request.refresh_token = { token: refreshToken };
      return true;
    } catch (error) {
      console.error('Error during token verification:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }

      console.error('Unexpected error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
