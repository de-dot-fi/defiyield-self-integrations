import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { WhiteWhaleLiquidity } from './modules/WhiteWhaleLiquidity';

const project: ProjectDefinitionInterface = {
  name: 'WhiteWhale',
  categories: ['Yield'],
  links: {
    logo: 'https://icons.de.fi/icons/studio/protocols/whitewhale.webp',
    url: 'https://app.whitewhale.money/',
    discord: 'https://twitter.com/WhiteWhaleDefi',
    telegram: 'https://t.me/whitewhaleofficial',
    twitter: 'https://twitter.com/WhiteWhaleDefi',
    github: 'https://github.com/White-Whale-Defi-Platform',
  },
  modules: [WhiteWhaleLiquidity('juno'), WhiteWhaleLiquidity('terra-2')],
};

export default project;
