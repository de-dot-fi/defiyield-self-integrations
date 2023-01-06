import { AxiosInstance, AxiosStatic } from 'axios';
import type BigNumber from 'bignumber.js';
import type * as ethcall from 'ethcall';
import type * as cardano from '../utils/cardano';
import type { ethers } from 'ethers';

export type SupportedChain =
  | 'arbitrum'
  | 'aurora'
  | 'avalanche'
  | 'binance'
  | 'boba'
  | 'celo'
  | 'cronos'
  | 'ethereum'
  | 'fantom'
  | 'fuse'
  | 'gnosis'
  | 'harmony'
  | 'heco'
  | 'iotex'
  | 'kava'
  | 'klaytn'
  | 'kucoin'
  | 'metis'
  | 'milkomedia'
  | 'moonbeam'
  | 'moonriver'
  | 'okx'
  | 'optimism'
  | 'polygon'
  | 'cardano';

export type SupportedProtocolType = 'staking' | 'lending' | 'pools';

export interface LoggerInterface {
  debug: (msg: string) => void;
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: unknown) => void;
}

export type Context = {
  ethers: typeof ethers;
  cardano: typeof cardano;
  provider: ethers.providers.BaseProvider;
  ethcall: typeof ethcall;
  ethcallProvider: ethcall.Provider;
  logger: LoggerInterface;
  BigNumber: typeof BigNumber;
  axios: AxiosInstance | AxiosStatic;
};

export type Address = string;

export type Token = {
  address: Address;
  name?: string;
  symbol?: string;
  decimals: number;
  displayName?: string;
  icon?: string;
  chainId?: number;

  underlying: TokenUnderlying[];
  price?: number;
  totalSupply?: string;
};

export interface TokenUnderlying extends Token {
  reserve?: number;
}

type RewardRate = {
  year: number;
};

export type PoolSupplied = { token: Token; tvl?: number; apr?: RewardRate; ltv?: number };
export type PoolRewarded = { token: Token; tvl?: number; apr?: RewardRate };
export type PoolBorrowed = { token: Token; tvl?: number; apr?: RewardRate };

export type UserSupplied = PoolSupplied & { balance: number; isCollateral?: boolean };
export type UserRewarded = PoolRewarded & { balance: number };
export type UserBorrowed = PoolBorrowed & { balance: number };

type GenericPool<TSupplied, TRewarded, TBorrowed> = {
  id: string;
  supplied?: TSupplied[];
  rewarded?: TRewarded[];
  borrowed?: TBorrowed[];
  extra?: { [key: string]: unknown };
};

export type Pool = GenericPool<PoolSupplied, PoolRewarded, PoolBorrowed>;

export type FetchPoolsContext = Context & {
  tokens: Token[];
};
export type FetchUserPositionsContext = Context & {
  pools: Pool[];
  user: Address;
};

export type FetchTokenDetailsContext = Context & {
  address: Address;
};

export type FetchTokenPricesContext = Context & {
  assets: ComplexAsset[];
  allAssets: ComplexAsset[];
};

export type UserPosition = GenericPool<UserSupplied, UserRewarded, UserBorrowed>;

export type TokenDetail = {
  name?: string;
  symbol?: string;
  icon?: string;
  address: Address;
  decimals: number;
  displayName?: string;
  underlying?: Address[];
  metadata?: AssetMetadata;
};

export type TokenExtraUnderlying = {
  address: Address;
  reserve?: string;
  price?: number;
};

export type TokenExtra = {
  address: Address;
  price?: number;
  underlying?: TokenExtraUnderlying[];
  totalSupply?: string;
};

/** Price provider */
export type UnderlyingAsset = {
  address: string;
  decimals: number;
  price: number;
};
export type ComplexAssetCategory = {
  code: string;
};
export interface AssetMetadata {
  coingeckoId?: string;
  coinmarketcapId?: string;
  marketCapRank?: number;
  coingeckoRank?: number;
  [key: string]: unknown;
}
export interface ComplexAsset {
  address: string;
  price?: number;
  decimals: number;
  categories: ComplexAssetCategory[];
  underlying: UnderlyingAsset[];
  metadata: AssetMetadata;
}

export interface IPlatformLinks {
  url: string; // website url
  logo: string; // main platform logo
  discord?: string; // project discord
  twitter?: string; // project twitter
  telegram?: string; // community telegram channel
  github?: string; // github profile
}

export type ProjectCategories =
  | 'DEX'
  | 'Yield'
  | 'Lending'
  | 'CDP'
  | 'Yield Aggregator'
  | 'Cross Chain'
  | 'Liquid Staking'
  | 'POS Staking'
  | 'Derivatives'
  | 'Algo-stable'
  | 'Insurance'
  | 'Synthetics'
  | 'Gaming'
  | 'Governance'
  | 'NFT Marketplace'
  | 'NFT Lending'
  | 'Other';
export type Instantiable<T = unknown> = { new (...args: unknown[]): T };
export type ClassBasedModuleDefinitionInterface = new () => ModuleDefinitionInterface;

/** End of price provider */
export interface ProjectDefinitionInterface {
  name: string;
  categories: ProjectCategories[];
  links: IPlatformLinks;
  modules: (ModuleDefinitionInterface | ClassBasedModuleDefinitionInterface)[];
}

export interface ModuleDefinitionInterface {
  name: string;

  chain: SupportedChain;

  type: SupportedProtocolType;

  /**
   * Return an array of tokens involved in this protocol. These will be the only tokens available
   * when getting the pool data, so make sure to include all deposited tokens (LP's etc),
   * Tokenized position or Vault tokens, and any reward tokens you need.
   */
  preloadTokens: (context: Context) => Promise<Address[]>;

  /**
   * This will return a list of all available pools for the protocol
   */
  fetchPools: (context: FetchPoolsContext) => Promise<(Pool | void)[]>;

  fetchUserPositions: (context: FetchUserPositionsContext) => Promise<(UserPosition | void)[]>;

  fetchMissingTokenDetails?: (context: FetchTokenDetailsContext) => Promise<TokenDetail | void>;

  fetchMissingTokenPrices?: (context: FetchTokenPricesContext) => Promise<TokenExtra[]>;
}
