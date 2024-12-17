import { Module } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/domain/user.entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../auth.controller';
import { UserModule } from '../../user/user/user.module';
import { RefreshTokenEntity } from 'src/modules/refresh-token/domain/refresh-token.entity/refresh-token.entity';
import { RefreshTokenModule } from 'src/modules/refresh-token/refresh/refresh-token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshTokenEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: {
          expiresIn: '5m',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    UserModule,
    RefreshTokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
