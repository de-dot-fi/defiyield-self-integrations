import type { ProjectDefinitionInterface } from '@defiyield/sandbox';

import { DavosProtocol } from './modules/DUSDStake';

const project: ProjectDefinitionInterface = {
  name: 'DavosProtocol',
  categories: ['Decentralized Lending'],
  links: {
    logo: 'https://ibb.co/S6nR5gH',
    url: 'https://davos.xyz/',
    telegram: 'https://t.me/davosprotocol',
    twitter: 'https://twitter.com/Davos_Protocol',
    github: 'https://github.com/davos-money/new-davos-smart-contracts',
  },
  modules: [DUSDStake],
};

export default project;
