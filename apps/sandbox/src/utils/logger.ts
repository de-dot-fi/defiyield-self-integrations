import pino from 'pino';
import config from '../../config';

const logger = pino({
  level: config.logs.level,
  transport: {
    target: 'pino-pretty',
    options: {
      ignore: 'pid,hostname',
      colorize: true,
    },
  },
});

export default logger;

export const logTime = async <T>(key: string, cb: () => Promise<T>) => {
  const start = Date.now();
  try {
    const data = await cb();
    const time = `(${Date.now() - start}ms)`.padEnd(10);
    logger.info(`${time} - ${key} has completed`);
    return data;
  } catch (err) {
    const time = `(${Date.now() - start}ms)`.padEnd(10);
    logger.error(`${time} - ${key} has FAILED`);
    throw err;
  }
};
