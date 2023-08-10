import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { getPool } from './modules/pools';

const project: ProjectDefinitionInterface = {
  name: 'Wombat Exchange',
  categories: ['DEX', 'Cross Chain', 'Liquid Staking'],
  links: {
    logo: 'https://assets.coingecko.com/coins/images/26946/large/Wombat_Token.png',
    url: 'https://www.wombat.exchange/',
    discord: 'https://discord.com/invite/wombat',
    telegram: 'https://t.me/WombatExchange',
    twitter: 'https://twitter.com/WombatExchange',
    github: 'https://github.com/wombat-exchange/',
  },
  modules: [getPool('binance')],
};

export default project;
