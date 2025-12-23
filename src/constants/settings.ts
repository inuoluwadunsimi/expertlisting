// This is where i set config for database etc

import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  jwtPrivateKey: <string>process.env.JWT_PRIVATE_KEY,
  database: {
    host: <string>process.env.DB_HOST || 'localhost',
    port: parseInt(<string>process.env.DB_PORT || '5432'),
    username: <string>process.env.DB_USERNAME,
    password: <string>process.env.DB_PASSWORD,
    name: <string>process.env.DB_NAME,
    synchronize: process.env.NODE_ENV === 'development', // Auto-sync schema in dev only
  },
  google: {
    clientID: <string>process.env.GOOGLE_CLIENT_ID,
  },
  redis: {
    uri: <string>process.env.REDIS_URI,
  },
};
