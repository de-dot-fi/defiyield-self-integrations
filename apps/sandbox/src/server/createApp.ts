import Koa from 'koa';

import config from '../../config';

import { Project } from '../project';
import logger from '../utils/logger';

import router from './router';
import { nextEngine } from '../utils/nextjs';

export async function createAppForProject(project: Project) {
  const app = new Koa();

  app.context.project = project;

  // Prepare Next engine here
  // Handler is captured by all non-api routes in router
  await nextEngine.prepare();

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.on('error', (err) => {
    logger.error(err);
  });

  return app.listen(config.port, () => {
    logger.info(`listening on http://localhost:${config.port}`);
  });
}
