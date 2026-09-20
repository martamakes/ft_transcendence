import type { FastifyPluginAsync } from 'fastify';

/**
 * Temporary scaffold health contract.
 *
 * Prisma will replace the static DB response in the database subtask, while
 * retaining this route and its public response shape for Docker and CI checks.
 */
export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({
    status: 'ok',
    db: 'pending',
  }));
};
