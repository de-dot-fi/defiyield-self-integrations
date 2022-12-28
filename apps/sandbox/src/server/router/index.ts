import Router from '@koa/router';
import apiRouter from './api';
import webRouter from './web';

const rootRouter = new Router();

// API
rootRouter.use(apiRouter.routes());
rootRouter.use(apiRouter.allowedMethods());

// Next uses (*) wildcard for file based routing
// so it must go last
rootRouter.use(webRouter.routes());
rootRouter.use(webRouter.allowedMethods());

export default rootRouter;
