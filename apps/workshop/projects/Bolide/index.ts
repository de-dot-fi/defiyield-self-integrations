import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { DepositPools } from './modules/DepositPools';
import { StakingPools } from './modules/StakingPools';
import { FarmingPools } from './modules/FarmingPools';

const project: ProjectDefinitionInterface = {
  name: 'Bolide',
  categories: ['Yield Aggregator'],
  links: {
    logo: 'https://invest.bolide.fi/img/BLID_token_logo_2000x2000.png',
    url: 'https://bolide.fi/',
    discord: 'https://discord.gg/bolide-invite',
    telegram: 'https://t.me/bolidechat',
    twitter: 'https://twitter.com/Bolide_fi',
    github: 'https://github.com/bolide-fi/',
  },
  modules: [DepositPools, StakingPools, FarmingPools],
};

export default project;
