import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { veSIS } from './modules/veSIS';
import { getPool } from './modules/pools';

const project: ProjectDefinitionInterface = {
  name: 'Symbiosis Finance',
  categories: ['Cross Chain'],
  links: {
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/15084.png',
    url: 'https://symbiosis.finance/',
    discord: 'https://discord.com/invite/YHgDSJ42eG',
    telegram: 'https://t.me/symbiosis_finance',
    twitter: 'https://twitter.com/symbiosis_fi',
    github: 'https://github.com/symbiosis-finance',
  },
  modules: [
    veSIS('ethereum'),
    veSIS('binance'),
    getPool('ethereum'),
    getPool('binance'),
    getPool('avalanche'),
    getPool('polygon'),
    getPool('boba'),
    getPool('kava-evm'),
  ],
};

export default project;
