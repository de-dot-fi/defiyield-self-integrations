import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { CroSwap } from './modules/CroSwap';

const project: ProjectDefinitionInterface = {
  name: 'CroSwap',
  categories: ['DEX', 'Yield'],
  links: {
    logo: 'https://imagedelivery.net/4JqAggdip6pa4pVpaZLoDA/croswap-black/scale',
    url: 'https://croswap.com/',
    discord: 'https://discord.gg/croswap',
    telegram: 'https://t.me/CroSwapOfficial',
    twitter: 'https://twitter.com/CroSwapOfficial',
    github: '',
  },
  modules: [CroSwap],
};

export default project;
