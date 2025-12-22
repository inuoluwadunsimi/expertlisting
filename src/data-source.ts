import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './constants/settings';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  synchronize: config.database.synchronize,
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/entities/**/*.entity.{ts,js}'],
  migrations: ['src/migrations/**/*.{ts,js}'],
  subscribers: [],
});
