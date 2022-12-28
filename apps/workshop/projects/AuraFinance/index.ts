import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import LockAura from './modules/LockAura';
import StakeBalancerTokens from './modules/StakeBalancerTokens';
import * as AuraBal from './modules/AuraBal';
import LockAuraClaimable from './modules/LockAuraClaimable';

const project: ProjectDefinitionInterface = {
  name: 'AuraFinance',
  categories: ['Governance', 'Yield'],
  links: {
    logo: 'https://defiyield-icons.s3.eu-central-1.amazonaws.com/studio/protocols/aura.webp',
    url: 'https://aura.finance/',
    discord: 'https://discord.gg/aurafinance',
    twitter: 'https://twitter.com/aurafinance',
    github: 'https://github.com/aurafinance',
  },
  modules: [LockAura, LockAuraClaimable, AuraBal, StakeBalancerTokens],
};

export default project;
