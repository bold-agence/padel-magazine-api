import 'reflect-metadata';
import { DataSource } from 'typeorm';

const isProd = (process.env.NODE_ENV ?? 'development') === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: !isProd, // jamais en prod
  migrationsRun: isProd && process.env.TYPEORM_MIGRATIONS_RUN === 'true',
});

