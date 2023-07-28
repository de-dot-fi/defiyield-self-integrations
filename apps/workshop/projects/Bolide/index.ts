import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { StakingPools } from './modules/StakingPools';
import { FarmingPools } from './modules/FarmingPools';
import { DepositPoolsBase } from './modules/DepositPoolsBase';

const project: ProjectDefinitionInterface = {
  name: 'Bolide',
  categories: ['Yield Aggregator'],
  links: {
    logo: 'https://icons.de.fi/icons/studio/protocols/bolide.webp',
    url: 'https://bolide.fi/',
    discord: 'https://discord.gg/bolide-invite',
    telegram: 'https://t.me/bolidechat',
    twitter: 'https://twitter.com/Bolide_fi',
    github: 'https://github.com/bolide-fi/',
  },
  modules: [
    new DepositPoolsBase('binance'),
    new DepositPoolsBase('polygon'),
    FarmingPools,
    StakingPools,
  ],
};

export default project;
