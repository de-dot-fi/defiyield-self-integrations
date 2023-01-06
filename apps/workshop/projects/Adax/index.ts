import type { ProjectDefinitionInterface } from '@defiyield/sandbox';

import { AdaxLiquidity } from './modules/AdaxLiquidity';

const project: ProjectDefinitionInterface = {
  name: 'ADAX',
  categories: ['DEX'],
  links: {
    twitter: 'https://twitter.com/adax_pro',
    telegram: 'https://t.me/adaxcommunity',
    discord: 'https://discord.com/invite/GxXNQ9zS8e',
    url: 'https://adax.pro/',
    logo: 'https://defiyield-icons.s3.eu-central-1.amazonaws.com/integrations/protocols/adax.webp',
  },
  modules: [AdaxLiquidity],
};

export default project;
