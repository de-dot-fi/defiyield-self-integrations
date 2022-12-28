import { Pool, Token } from '../../types/module';
import Router from '@koa/router';

const apiRouter = new Router({ prefix: '/api/' });

apiRouter.get('platform', (ctx) => {
  const now = Date.now();
  ctx.body = {
    time: Date.now() - now,
    meta: ctx.project.getPlatformMeta(),
  };
});

apiRouter.get('tokens', async (ctx) => {
  const now = Date.now();
  const tokens: Token[] = (await ctx.project.preloadTokens()).flat();

  ctx.body = {
    time: Date.now() - now,
    // show unique tokens only
    tokens: tokens.filter((a, idx) => idx === tokens.findIndex((b) => b.address === a.address)),
  };
});

apiRouter.get('pools', async (ctx) => {
  const now = Date.now();
  const pools: Pool[] = await ctx.project.fetchPools();
  ctx.body = {
    time: Date.now() - now,
    pools: pools.flat(),
  };
});

apiRouter.get('users/:user', async (ctx) => {
  const now = Date.now();
  const user = await ctx.project.fetchUserPositions(ctx.params.user);
  ctx.body = {
    time: Date.now() - now,
    user,
  };
});

export default apiRouter;
