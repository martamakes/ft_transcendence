import { buildApp } from './app.js';

const port = Number.parseInt(process.env.BACKEND_PORT ?? '3000', 10);
const host = process.env.BACKEND_HOST ?? '0.0.0.0';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('BACKEND_PORT must be an integer between 1 and 65535');
}

const app = await buildApp();

const shutdown = async (signal: string): Promise<void> => {
  app.log.info({ signal }, 'Shutting down backend');
  await app.close();
  process.exit(0);
};

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error, 'Unable to start backend');
  process.exit(1);
}
