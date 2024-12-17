import { RefreshTokenEntity } from 'src/modules/refresh-token/domain/refresh-token.entity/refresh-token.entity';
import { User } from 'src/modules/user/domain/user.entity/user.entity';
import { DataSourceOptions, DataSource } from 'typeorm';     

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'nestjs_project',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
