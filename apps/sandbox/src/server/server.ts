import nodemon from 'nodemon';
import { Server } from 'http';

import { AdapterOptions } from '../types/adapter';
import { initializeProviders } from '../providers';
import { Project } from '../project';
import logger, { logTime } from '../utils/logger';
import { createAppForProject } from './createApp';
import { join } from 'path';

let server: Server;

export const serve = async (adapter: AdapterOptions) => {
  // TODO: use dotenv or config file to avoid hardcoded RPC's
  const providers = await logTime('initializeProviders', initializeProviders);

  nodemon({
    script: adapter.path,
    ext: 'ts js json',
    quiet: true,
    // In some cases, Nodemon doesn't exit properly when requested
    // This delay should be enough to make sure it restarts properly
    delay: 250,
    watch: [
      join(adapter.path, '../../../'), // workshop
      join(__dirname, '../', '**/*.ts'), // server
    ],
  });

  nodemon
    .on('start', async function () {
      logger.info(`Restarting Server`);

      // clear screen
      process.stdout.write('\x1Bc');

      server?.close();

      const project = new Project(adapter, providers);
      await project.init();

      server = await createAppForProject(project);
      server.on('error', (err) => {
        logger.error({ err });
      });
    })
    .on('quit', function () {
      server?.close();
      process.exit();
    });
};
