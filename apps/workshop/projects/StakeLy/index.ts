import type { ProjectDefinitionInterface } from '@defiyield/sandbox';

import { KlayStake } from './modules/KlayStake';

const project: ProjectDefinitionInterface = {
  name: 'StakeLy',
  categories: ['Liquid Staking'],
  links: {
    logo: 'https://icons.de.fi/icons/studio/protocols/stake-ly.webp',
    url: 'https://stake.ly/en',
    telegram: 'https://t.me/stake_ly',
    twitter: 'https://twitter.com/stake_ly',
    github: 'https://github.com/stakely-protocol',
  },
  modules: [KlayStake],
};

export default project;
