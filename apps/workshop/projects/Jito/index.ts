import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { JitoStaking } from './modules/JitoStaking';

const project: ProjectDefinitionInterface = {
  name: 'Jito',
  categories: ['Liquid Staking'],
  links: {
    logo: 'https://defiyield-icons.s3.eu-central-1.amazonaws.com/integrations/protocols/jito.webp',
    url: 'https://www.jito.network/',
    discord: 'https://discord.com/invite/jito',
    twitter: 'https://twitter.com/jito_sol',
    github: 'https://github.com/jito-foundation',
  },
  modules: [JitoStaking],
};

export default project;
