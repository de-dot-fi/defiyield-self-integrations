import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { WhiteWhaleLiquidity } from './modules/WhiteWhaleLiquidity';

const project: ProjectDefinitionInterface = {
  name: 'WhiteWhale',
  categories: ['Yield'],
  links: {
    logo: 'https://app.whitewhale.money/img/logo.svg',
    url: 'https://app.whitewhale.money/',
    discord: 'https://twitter.com/WhiteWhaleDefi',
    telegram: 'https://t.me/whitewhaleofficial',
    twitter: 'https://twitter.com/WhiteWhaleDefi',
    github: 'https://github.com/White-Whale-Defi-Platform',
  },
  modules: [WhiteWhaleLiquidity],
};

export default project;
