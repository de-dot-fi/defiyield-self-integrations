import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { DepositPoolsBnb } from './modules/DepositPoolsBnb';
import { DepositPoolsPolygon } from './modules/DepositPoolsPolygon';
import { StakingPools } from './modules/StakingPools';
import { FarmingPools } from './modules/FarmingPools';

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
  modules: [DepositPoolsBnb, DepositPoolsPolygon, FarmingPools, StakingPools],
};

export default project;
