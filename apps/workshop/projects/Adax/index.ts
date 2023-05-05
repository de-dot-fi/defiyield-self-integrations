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
    logo: 'https://icons.de.fi/icons/studio/protocols/adax.webp',
  },
  modules: [AdaxLiquidity],
};

export default project;
