import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { veSIS } from './modules/veSIS';
import { getPool } from './modules/pools';
import { lpFarm } from './modules/lpFarm';

const project: ProjectDefinitionInterface = {
  name: 'Symbiosis Finance',
  categories: ['Cross Chain'],
  links: {
    logo: 'https://icons.de.fi/icons/studio/protocols/symbiosis-finance.webp',
    url: 'https://symbiosis.finance/',
    discord: 'https://discord.com/invite/YHgDSJ42eG',
    telegram: 'https://t.me/symbiosis_finance',
    twitter: 'https://twitter.com/symbiosis_fi',
    github: 'https://github.com/symbiosis-finance',
  },
  modules: [
    // veSIS('ethereum'),
    // veSIS('binance'),
    getPool('ethereum'),
    getPool('binance'),
    getPool('avalanche'),
    getPool('polygon'),
    getPool('boba'),
    getPool('kava-evm'),
    // lpFarm('ethereum'),
    // lpFarm('arbitrum'),
    // lpFarm('binance'),
  ],
};

export default project;
