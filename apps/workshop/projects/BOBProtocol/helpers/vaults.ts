import { Address, Pool, Token, PoolSupplied, SupportedChain } from '@defiyield/sandbox';
import { VaultConfig, VAULTS, VAULT_TOKENS } from './config';
import { Pair, OrderBook, getPairs, getOrderBookForTicker, getTvlFromOrderbook } from './api';

const MGS_UNSOPPORTED_CHAIN = 'Unsupported chain';

type TokenInPair = {
  [symbol: string]: string;
};

type Orderbooks = {
  [ticker: string]: OrderBook;
};

type VaultPerChain = {
  [chainId: string]: Vault;
};

export class Vaults {
  private static instance: Vaults;
  private chain_vaults: VaultPerChain = {};

  private constructor() {
    this.chain_vaults = {};
  }

  public static getInstance(): Vaults {
    if (!Vaults.instance) {
      Vaults.instance = new Vaults();
    }

    return Vaults.instance;
  }

  public async getVault(chain: SupportedChain, axios: any, logger: any): Promise<Vault> {
    if (!this.chain_vaults[chain]) {
      this.chain_vaults[chain] = new Vault(chain, axios, logger);
      await this.chain_vaults[chain].initVault();
    }
    return this.chain_vaults[chain];
  }
}

function getVaultConfig(chain: SupportedChain): VaultConfig {
  const currentVault = VAULTS[chain];
  if (!currentVault) {
    throw new Error(MGS_UNSOPPORTED_CHAIN);
  }
  return currentVault;
}

export class Vault {
  private chain: SupportedChain = 'ethereum';
  private id = '';
  private base_url = '';
  private tokens: TokenInPair = {};
  private cached_orderbooks: Orderbooks = {};
  private axios: any;
  private logger: any;

  public constructor(chain: SupportedChain, axios: any, logger: any) {
    this.chain = chain;
    this.axios = axios;
    this.logger = logger;
  }

  private log_info(message: string) {
    this.logger.info(message);
  }

  private log_warn(message: string) {
    this.logger.warn(message);
  }

  private getTokenAddressBySymbol(symbol: string): Address | null {
    // TODO: wait for BOBStats API update to get token addresses from there
    const source = VAULT_TOKENS[this.chain];
    if (!source) {
      throw new Error(MGS_UNSOPPORTED_CHAIN);
    }
    if (source[symbol]) {
      return source[symbol];
    } else {
      return null;
    }
  }

  private getTokenSymbolByAddress(address: Address): string | null {
    // TODO: wait for BOBStats API update to get token addresses from there
    const source = VAULT_TOKENS[this.chain];
    if (!source) {
      throw new Error(MGS_UNSOPPORTED_CHAIN);
    }
    for (const i in source) {
      if (source[i] === address) return i;
    }
    return null;
  }

  private isTokenRegistered(symbol: string): boolean {
    const address = this.getTokenAddressBySymbol(symbol);
    if (address) {
      if (this.tokens[address]) {
        return true;
      }
    } else throw new Error(`Token ${symbol} not found`);
    return false;
  }

  private registerToken(symbol: string, ticker: string) {
    const address = this.getTokenAddressBySymbol(symbol);
    if (address) {
      this.tokens[address] = ticker;
      this.log_info(`${this.chain}: ${symbol}/${address} added`);
    } else throw new Error(`Token ${symbol} not found`);
  }

  public async initVault() {
    const v = getVaultConfig(this.chain);
    const pairs = await getPairs(v.url, this.axios, this.logger);
    if (pairs) {
      this.base_url = v.url;
      for (const pair of pairs as Pair[]) {
        this.id = pair.pool_id;
        this.log_info(`${this.chain}: discovered ${pair.ticker_id} on ${pair.pool_id}`);
        if (!this.isTokenRegistered(pair.base)) this.registerToken(pair.base, pair.ticker_id);
        if (!this.isTokenRegistered(pair.target)) this.registerToken(pair.target, pair.ticker_id);
      }
    }
  }

  async getTokens(): Promise<Address[]> {
    const tokens: Address[] = [];
    for (const i in this.tokens) {
      tokens.push(i);
    }
    return tokens;
  }

  private async cacheOrderbook(ticker: string) {
    if (!this.cached_orderbooks[ticker]) {
      this.log_info(`${this.chain}: no orderbook found in the cache`);
      const ob = await getOrderBookForTicker(this.base_url, ticker, this.axios, this.logger);
      if (ob) {
        this.cached_orderbooks[ticker] = ob;
      }
    }
  }

  private extractTVL(ticker: string, symbol: string): number {
    const tvl = getTvlFromOrderbook(this.cached_orderbooks[ticker], symbol);
    if (tvl === 0) {
      this.log_warn(`${this.chain}: TVL: 0`);
    } else {
      this.log_info(`${this.chain}: TVL: ${tvl}`);
    }
    return tvl;
  }

  async composePoolInfo(tokens: Token[]): Promise<Pool[]> {
    this.cached_orderbooks = {};
    const supplied: PoolSupplied[] = [];
    for (const token of tokens) {
      this.log_info(`${this.chain}: getting TVL for ${token.symbol}/${token.address}`);
      const ticker = this.tokens[token.address];
      if (ticker) {
        this.log_info(`${this.chain}: from the orderbook for ${ticker}`);
        await this.cacheOrderbook(ticker);
        // token.sybmbol cannot be used here due to symbol incosistency on de.fi api
        const symbol = this.getTokenSymbolByAddress(token.address);
        if (symbol) {
          const tvl = this.extractTVL(ticker, symbol);
          const one_token: PoolSupplied = {
            token: token,
            tvl: tvl,
          };
          supplied.push(one_token);
        } else {
          this.log_warn(`${this.chain}: symbol not found`);
        }
      } else {
        this.log_warn(`${this.chain}: ticker not found`);
      }
    }
    return [
      {
        id: this.id,
        supplied: supplied,
      },
    ];
  }
}
