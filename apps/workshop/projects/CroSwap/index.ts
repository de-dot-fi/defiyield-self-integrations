import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { CroSwap } from './modules/CroSwap';

const project: ProjectDefinitionInterface = {
  name: 'CroSwap',
  categories: ['DEX', 'Yield'],
  links: {
    logo: 'https://icons.de.fi/icons/studio/protocols/croswap.webp',
    url: 'https://croswap.com/',
    discord: 'https://discord.gg/croswap',
    telegram: 'https://t.me/CroSwapOfficial',
    twitter: 'https://twitter.com/CroSwapOfficial',
    github: '',
  },
  modules: [CroSwap],
};

export default project;
