/* istanbul ignore file */
import 'reflect-metadata';
import errorHandler from 'errorhandler'

import app from '../app';
import { connectPostgres } from '../helpers/postgres.connector';
import { connectRedis } from '../helpers/redis.connector';

app.use(errorHandler());

(async () => {
  // Initialize server
  const server = app.listen(process.env.APP_PORT || 8000, () => {
    connectPostgres();
    connectRedis();
  });

  // Nodemon dev hack
  process.once('SIGUSR2', function () {
    server.close(function () {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
})();
