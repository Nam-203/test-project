import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenEntity } from 'src/modules/refresh-token/domain/refresh-token.entity/refresh-token.entity';
import { User } from 'src/modules/user/domain/user.entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { CreateAuthDto } from 'src/common/dto/auth.dto/createAuthDto.dto';
import { LoginDto } from 'src/common/dto/auth.dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
    });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await this.generateHashPassword(
      createAuthDto.password,
    );
    const user = this.userRepository.create({
      ...createAuthDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  private async generateHashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, email: user.email };
    const { access_token, refresh_token } = await this.generateToken(payload);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      user,
      token: refresh_token,
      device: loginDto.device,
      ipAddress: loginDto.ipAddress,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { user, refresh_token, access_token };
  }

  private async generateToken(payload) {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '14d',
      algorithm: 'HS256',
    });
    return {
      access_token,
      refresh_token,
    };
  }
}
