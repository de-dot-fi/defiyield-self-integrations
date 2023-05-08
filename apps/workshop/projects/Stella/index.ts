import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { Farm } from './modules/Farm';

const project: ProjectDefinitionInterface = {
  name: 'Stella',
  categories: ['DEX', 'Cross Chain'],
  links: {
    logo: 'https://app.stellaswap.com/images/tokens/stella.png',
    url: 'https://stellaswap.com/',
    discord: 'https://discord.stellaswap.com/',
    telegram: 'https://t.me/stellaswap',
    twitter: 'https://twitter.com/StellaSwap',
    github: 'https://github.com/stellaswap',
  },
  modules: [Farm],
};

export default project;
