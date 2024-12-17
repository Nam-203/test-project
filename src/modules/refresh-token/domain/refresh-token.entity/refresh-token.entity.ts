import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from '../../../user/domain/user.entity/user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column({ nullable: true })
  device: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column()
  revoked_at: Date;

  @Column({ default: false })
  is_revoked: boolean;
  @CreateDateColumn()
  create_at: Date;

  @UpdateDateColumn()
  update_at: Date;
  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: number;
}
