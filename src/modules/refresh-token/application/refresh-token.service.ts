import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenEntity } from '../domain/refresh-token.entity/refresh-token.entity';
import { User } from 'src/modules/user/domain/user.entity/user.entity';
import { RefreshTokenDto } from 'src/common/dto/refresh-token.dto/refresh-token.dto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async refreshAccessToken(refreshTokenDto: RefreshTokenDto) {
    const isValid = await this.isRefreshTokenValid(refreshTokenDto);
    if (!isValid) {
      throw new UnauthorizedException('revoked refresh token');
    }
    const decoded = await this.jwtService.verifyAsync(refreshTokenDto.token, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    });
    if (!decoded?.email) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { id, email } = decoded;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const tokenInDb = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenDto.token, user: { id } },
      relations: ['user'],
    });
    if (!tokenInDb) {
      throw new NotFoundException('Token does not exist');
    }
    if (tokenInDb.user.id !== id) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (tokenInDb.is_revoked) {
      throw new ForbiddenException('Refresh token has been revoked');
    }

    const payload = { id: user.id, email: user.email };
    const newAccessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('SECRET_KEY'),
    });

    return { access_token: newAccessToken };
  }

  async revokeRefreshToken(refreshTokenDto: RefreshTokenDto) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenDto.token },
    });
    if (refreshToken) {
      refreshToken.is_revoked = true;
      refreshToken.revoked_at = new Date();
      return this.refreshTokenRepository.save(refreshToken);
    }
    return null;
  }

  async isRefreshTokenValid(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<boolean> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenDto.token },
    });
    return refreshToken && !refreshToken.is_revoked;
  }
  async revokeAllRefreshTokens(id: number): Promise<UpdateResult> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('No user found with the provided ID');
    }

    const refreshTokens = await this.refreshTokenRepository.find({
      where: { userId: id },
    });

    if (refreshTokens.length === 0) {
      return;
    }

    return this.refreshTokenRepository.update(
      { userId: id },
      { is_revoked: true },
    );
  }
}
