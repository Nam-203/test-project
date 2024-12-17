import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity/user.entity';
import { CreateAuthDto } from 'src/common/dto/auth.dto/createAuthDto.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const user = await this.userRepository.save(createAuthDto);
    return user;
  }
}
