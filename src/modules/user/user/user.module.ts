import { Module } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../domain/user.entity/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
