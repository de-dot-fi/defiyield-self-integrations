import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { LendingPools } from './modules/LendingPools';
import { LYF } from './modules/LYF';

const project: ProjectDefinitionInterface = {
  name: 'Single Finance',
  categories: ['Yield', 'Lending', 'Yield Aggregator', 'Synthetics'],
  links: {
    logo: 'https://app.singlefinance.io/logo512.png',
    url: 'https://app.singlefinance.io',
    discord: 'https://discord.com/invite/97W57CjJme',
    telegram: 'https://t.me/singlefinanceofficial',
    twitter: 'https://twitter.com/single_finance',
  },
  modules: [
    LendingPools('cronos'),
    LendingPools('fantom'),
    LendingPools('arbitrum'),
    LYF('cronos', 'vvs'),
    LYF('cronos', 'mmf'),
    LYF('fantom', 'spooky'),
    LYF('arbitrum', 'sushi'),
    LYF('arbitrum', 'camelot'),
  ],
};

export default project;
