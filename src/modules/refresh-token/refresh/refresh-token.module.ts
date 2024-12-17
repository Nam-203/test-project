import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from '../domain/refresh-token.entity/refresh-token.entity';
import { RefreshTokenService } from '../application/refresh-token.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../../user/domain/user.entity/user.entity';
import { RefreshTokenController } from '../refresh-token.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEntity, User]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
