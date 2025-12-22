import { AppDataSource } from '../data-source';

export async function connectPostgres() {
  try {
    await AppDataSource.initialize();
    console.info('PostgreSQL Connection Established');
    
    // Log connection details in development
    if (process.env.NODE_ENV === 'development') {
      console.info(`Connected to database: ${AppDataSource.options.database}`);
    }
  } catch (err) {
    console.error('PostgreSQL Connection Error:', err);
    process.exit(1);
  }


  // If the Node process ends, close the PostgreSQL connection
  process.on('SIGINT', async () => {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.info('PostgreSQL connection closed through app termination');
      }
    } catch (err) {
      console.error('Could not close PostgreSQL Connection');
      console.error(err);
    }
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.info('PostgreSQL connection closed through app termination');
      }
    } catch (err) {
      console.error('Could not close PostgreSQL Connection');
      console.error(err);
    }
    process.exit(0);
  });
}
