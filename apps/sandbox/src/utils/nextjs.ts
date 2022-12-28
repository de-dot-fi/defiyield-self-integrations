import nextjs from 'next';
import { join } from 'path';
import logger from './logger';

export const nextEngine = nextjs({
  dev: true,
  dir: join(__dirname, '../', 'client'),
  quiet: true,
});

export const nextHandler = nextEngine.getRequestHandler();

// Monkey-patch Next.js logger.
// See https://github.com/atkinchris/next-logger/blob/main/index.js
// See https://github.com/vercel/next.js/blob/canary/packages/next/build/output/log.ts
// See https://github.com/vercel/next.js/issues/4808#issuecomment-921062805
import * as nextReadonlyLogger from 'next/dist/build/output/log';
for (const [property, value] of Object.entries(nextReadonlyLogger)) {
  // Unavailable (and unneeded) in testing: TypeError: 'set' on proxy: trap returned falsish for property 'error'
  if (process.env.NODE_ENV === 'test') {
    continue;
  }

  if (typeof value !== 'function') {
    continue;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (nextReadonlyLogger as any)[property] = (...message: any[]) => {
    const [first, ...rest] = message;
    if (['debug', 'info', 'warn', 'error'].includes(property)) {
      logger[property as 'debug' | 'info' | 'warn' | 'error'](first, ...rest);
    }
    logger.debug(first, ...rest);
  };
}
