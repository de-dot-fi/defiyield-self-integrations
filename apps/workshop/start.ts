import 'dotenv/config';
import { join } from 'path';
import { serve } from '@defiyield/sandbox';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const cli = yargs(hideBin(process.argv)).parse() as { _: string[] };
const [projectFolder] = cli._;

if (!projectFolder) {
  // eslint-disable-next-line no-console
  console.error(
    '\x1b[31m%s\x1b[0m',
    `Please supply a project folder, i.e. 'yarn workshop start MyExampleProject'`,
  );
  process.exit();
}

serve({
  name: projectFolder,
  path: join(__dirname, `projects`, projectFolder, 'index.ts'),
});
