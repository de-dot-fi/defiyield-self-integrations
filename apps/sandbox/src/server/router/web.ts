import Router from '@koa/router';
import { nextHandler } from '../../utils/nextjs';

/**
 * NextJS File based routing
 */
const nextRouter = new Router();
nextRouter.all('(.*)', async (ctx) => {
  await nextHandler(ctx.req, ctx.res);
  ctx.respond = false;
});

export default nextRouter;
