import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { veXY } from './modules/veXY';
import { YPool } from './modules/ypools';

const project: ProjectDefinitionInterface = {
  name: 'XY Finance',
  categories: ['Cross Chain', 'DEX'],
  links: {
    logo: 'https://defiyield-icons.s3.eu-central-1.amazonaws.com/studio/protocols/xy-finance.webp',
    url: 'https://app.xy.finance',
    discord: 'https://discord.com/invite/zHKxJYZ52P',
    telegram: 'https://t.me/xyfinance',
    twitter: 'https://twitter.com/xyfinance',
    // github: '',
  },
  modules: [
    YPool('ethereum', 'ETH'),
    YPool('binance', 'ETH'),
    YPool('polygon', 'ETH'),
    YPool('fantom', 'ETH'),
    YPool('cronos', 'ETH'),
    YPool('avalanche', 'ETH'),
    YPool('arbitrum', 'ETH'),
    YPool('optimism', 'ETH'),
    YPool('ethereum', 'USDC'),
    YPool('binance', 'USDC'),
    YPool('polygon', 'USDC'),
    YPool('fantom', 'USDC'),
    YPool('cronos', 'USDC'),
    YPool('avalanche', 'USDC'),
    YPool('kucoin', 'USDC'),
    YPool('arbitrum', 'USDC'),
    YPool('optimism', 'USDC'),
    YPool('moonriver', 'USDC'),
    YPool('klaytn', 'USDC'),
    YPool('ethereum', 'USDT'),
    YPool('binance', 'USDT'),
    YPool('polygon', 'USDT'),
    YPool('fantom', 'USDT'),
    YPool('cronos', 'USDT'),
    YPool('avalanche', 'USDT'),
    YPool('kucoin', 'USDT'),
    YPool('arbitrum', 'USDT'),
    YPool('optimism', 'USDT'),
    YPool('moonriver', 'USDT'),
    YPool('klaytn', 'USDT'),
    veXY('ethereum'),
    veXY('binance'),
    veXY('polygon'),
    veXY('fantom'),
  ],
};

export default project;
