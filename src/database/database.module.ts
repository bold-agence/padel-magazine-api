import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

type AppConfig = {
  nodeEnv: 'development' | 'production' | 'test';
};

type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  name: string;
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get<DatabaseConfig>('database');
        const app = config.get<AppConfig>('app');
        const isProd = app?.nodeEnv === 'production';

        if (!db) {
          throw new Error('Config "database" manquante');
        }

        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.pass,
          database: db.name,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize: false,
          // In dev: auto-run pending migrations on app start (safe because
          // every migration is idempotent). In prod: opt-in via env var.
          migrationsRun: isProd
            ? process.env.TYPEORM_MIGRATIONS_RUN === 'true'
            : true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
