import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { getBobVault } from './modules/BobVault';

const project: ProjectDefinitionInterface = {
  name: 'BOB Protocol',
  categories: ['Synthetics'],
  links: {
    logo: 'https://icons.de.fi/eth/0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b/coingecko.webp',
    url: 'https://bob.zkbob.com/',
    discord: 'https://t.me/zkbobcommunity',
    telegram: 'https://t.me/zkbob_news',
    twitter: 'https://twitter.com/zkBob_',
    github: 'https://github.com/zkBob',
  },
  modules: [
    getBobVault('polygon'),
    getBobVault('binance'),
    getBobVault('ethereum'),
    getBobVault('optimism'),
    getBobVault('arbitrum'),
  ],
};

export default project;
