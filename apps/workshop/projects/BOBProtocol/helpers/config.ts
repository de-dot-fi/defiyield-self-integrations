import { Address, SupportedChain } from '@defiyield/sandbox';

export type VaultConfig = {
  url: string;
};

type Vaults = {
  readonly [chainId in SupportedChain]?: VaultConfig;
};

export const VAULTS: Vaults = {
  polygon: {
    url: 'https://supply.zkbob.com/coingecko/bobvault/polygon',
  },
  binance: {
    url: 'https://supply.zkbob.com/coingecko/bobvault/bsc',
  },
  ethereum: {
    url: 'https://supply.zkbob.com/coingecko/bobvault/mainnet',
  },
  optimism: {
    url: 'https://supply.zkbob.com/coingecko/bobvault/eth-opt',
  },
  arbitrum: {
    url: 'https://supply.zkbob.com/coingecko/bobvault/arbitrum1',
  },
};

type TokenBySymbol = {
  [symbol: string]: Address;
};

type VaultTokens = {
  readonly [chainId in SupportedChain]?: TokenBySymbol;
};

export const VAULT_TOKENS: VaultTokens = {
  polygon: {
    BOB: '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
    USDT: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDC: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
  binance: {
    BOB: '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  ethereum: {
    BOB: '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  optimism: {
    BOB: '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
  },
  arbitrum: {
    BOB: '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  },
};
