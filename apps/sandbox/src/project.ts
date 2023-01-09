import { AdapterInterface, AdapterOptions } from './types/adapter';
import {
  Address,
  ComplexAsset,
  Context,
  ModuleDefinitionInterface,
  ClassBasedModuleDefinitionInterface,
  Pool,
  Token,
  TokenDetail,
  UnderlyingAsset,
  SupportedChain,
} from './types/module';
import { ChainProvider, ProviderMap } from './types/provider';
import * as client from './utils/client-graphql';
import { createContext as createContextFunction } from './utils/context';
import { getInternalChainId } from './utils/internal';
import logger from './utils/logger';
import erc20Abi from '@defiyield/abi/erc20.abi.json';
import { dirname } from 'path';

function isModuleAProjectAdapter(module: unknown): module is AdapterInterface {
  if (!module) return false;
  if (typeof (module as AdapterInterface)?.name !== 'string') return false;
  return (module as AdapterInterface)?.modules?.length > 0;
}

function verifyProjectModule(projectModule: unknown): AdapterInterface {
  if (!isModuleAProjectAdapter(projectModule)) {
    throw new Error('Please supply a valid project adapter');
  }
  return projectModule;
}

export class Project {
  private readonly adapter: AdapterOptions;
  private modules: ModuleDefinitionInterface[] = [];
  private readonly providers: ProviderMap;
  private readonly tokens: Map<ModuleDefinitionInterface, string[]>;
  private readonly pools: Map<ModuleDefinitionInterface, Pool[]>;
  private meta: any;

  private readonly createContext: (chain: ChainProvider) => Context;
  private readonly tokenFetcher: (
    requests: { address: string; chainId: number }[],
  ) => Promise<Token[]>;

  constructor(
    adapter: AdapterOptions,
    providers: ProviderMap,

    // testing utils
    createContext: (chain: ChainProvider) => Context = createContextFunction,
    tokenFetcher: (
      requests: { address: string; chainId: number }[],
    ) => Promise<Token[]> = client.fetchTokens,
  ) {
    this.adapter = adapter;

    this.providers = providers;

    // TODO: this is a temp cache. need to handle robustly
    this.tokens = new Map();
    this.pools = new Map();

    this.createContext = createContext;
    this.tokenFetcher = tokenFetcher;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isConstructor(obj: any): obj is new (...args: any[]) => any {
    return !!obj?.prototype && !!obj?.prototype?.constructor?.name;
  }

  async init(
    options: { modules?: (ModuleDefinitionInterface | ClassBasedModuleDefinitionInterface)[] } = {},
  ) {
    // note: we must use require here to break the cache
    // dynamic imports will cache forever and don't have
    // a clean way to break the cache. This clears
    // all cache keys in the users project folder
    const basePath = dirname(this.adapter.path);
    Object.keys(require.cache).forEach((key) => {
      const filename = key.replace(dirname(basePath) + '/', '');
      try {
        if (key.startsWith(basePath)) {
          logger.debug(`Clearing Cache: ${filename}`);
          delete require.cache[require.resolve(key)];
        }
      } catch {
        logger.warn(`Failed to clear cache for ${filename}`);
      }
    });
    const { default: projectModule } = await import(this.adapter.path);
    const project = verifyProjectModule(projectModule);

    const activeModules = options?.modules?.length ? options.modules : project.modules;

    this.meta = project;
    this.modules = activeModules.map((m) => (this.isConstructor(m) ? new m() : m));
  }

  public getPlatformMeta() {
    return this.meta;
  }

  public getContextForChain(chain: SupportedChain): Context {
    const provider = this.providers.get(chain);
    if (!provider) {
      throw new Error(`Failed to get provider for ${chain}`);
    }

    return this.createContext(provider);
  }

  private async preloadModuleTokens(module: ModuleDefinitionInterface) {
    const context = this.getContextForChain(module.chain);

    // Cache token addresses since assets themselves are cached by the graphql client
    const tokenAddresses =
      this.tokens.get(module) || Array.from(new Set(await module.preloadTokens(context)));

    this.tokens.set(module, tokenAddresses);

    const tokens = await this.tokenFetcher(
      tokenAddresses.map((address) => ({
        chainId: getInternalChainId(module.chain),
        address,
      })),
    );

    const missedTokens = await this.fetchMissedTokenInfo(module, context, tokens, tokenAddresses);

    if (missedTokens?.length) {
      tokens.push(...missedTokens);
    }

    const priced = await this.fetchMissedTokenPrice(module, context, tokens);

    // TODO: validation for incoming tokens. have they all been found? do they all seem right? do we need to run an asset analyzer?

    // TODO: if a token resolver exists, merge the results of the token resolver

    if (priced.length !== tokenAddresses.length) {
      logger.warn(
        `Failed to resolve some tokens. Missing ${tokenAddresses.length - priced.length} tokens.
    ${tokenAddresses
      .filter((address) => !priced.some((t) => t.address.toLowerCase() === address.toLowerCase()))
      .join('\n    ')}

      -----

      ${priced
        .filter(
          (t) =>
            !tokenAddresses.some((address) => t.address.toLowerCase() === address.toLowerCase()),
        )
        .join('\n    ')}

`,
      );
    }

    return priced;
  }

  private async fetchMissedTokenPrice(
    module: ModuleDefinitionInterface,
    context: Context,
    tokens: Token[],
  ): Promise<Token[]> {
    if (!module.fetchMissingTokenPrices) {
      return tokens;
    }

    const flat = this.getMergedUniqueTokenMap(tokens);
    const unpriced = tokens.filter((t) => !t.price);
    const prices = await module.fetchMissingTokenPrices({
      ...context,
      allAssets: tokens.map(
        (u): ComplexAsset => ({
          address: u.address,
          decimals: u.decimals,
          price: u.price,
          categories: [],
          underlying: [],
          metadata: {},
        }),
      ),
      assets: unpriced.map(
        (u): ComplexAsset => ({
          address: u.address,
          decimals: u.decimals,
          categories: [],
          underlying: u.underlying.map((t): UnderlyingAsset => {
            const under = flat.get(t.address);
            if (!under) throw new Error(`Missing underlying asset ${t.address}`);

            return {
              address: under.address,
              decimals: under.decimals,
              price: under.price as number,
            };
          }),
          metadata: {},
        }),
      ),
    });

    const priceMap = new Map(prices.map((price) => [price.address, price]));

    return tokens.map((token) => {
      const price = priceMap.get(token.address);
      if (!price?.price) return token;

      return {
        ...token,
        price: price.price,
        totalSupply: price.totalSupply,
        underlying: token.underlying.map((u, idx) => {
          const underPrice = priceMap.get(u.address);
          if (!price.underlying?.length) throw new Error('Failed to find an underlying asset');

          return {
            ...u,
            u: underPrice?.price || u.price,
            reserve: Number(price.underlying[idx].reserve) / 10 ** u.decimals,
          };
        }),
      };
    });
  }

  private async fetchMissedTokenInfo(
    module: ModuleDefinitionInterface,
    context: Context,
    foundTokens: Token[],
    addresses: Address[],
  ) {
    const { fetchMissingTokenDetails } = module;
    if (!fetchMissingTokenDetails) {
      return;
    }
    // flatten all lps & underlying tokens, and returns map
    const tokenMap = this.getMergedUniqueTokenMap(foundTokens);

    const missed = addresses.filter((address) => !tokenMap.has(address));
    const found = new Array<Token>();

    if (missed.length) {
      await Promise.allSettled(
        missed.map(async (address) => {
          const newToken = await fetchMissingTokenDetails({
            ...context,
            address,
          });
          if (newToken) {
            found.push(await this.fillUnderlying(newToken, context));
          }
        }),
      );
    }
    return found;
  }

  private async fillUnderlying(token: TokenDetail, context: Context): Promise<Token> {
    if (!token.underlying?.length) {
      return {
        icon: '',
        ...token,
        displayName: token.displayName || token.symbol,
        underlying: [],
      };
    }

    const underlying = await this.fetchBasicTokenInfo(token.underlying, context);
    return {
      icon: '',
      ...token,
      displayName: Array.from(new Set(underlying.map((t) => t.symbol))).join('/'),
      underlying: underlying,
    };
  }

  private async fetchBasicTokenInfo(addresses: Address[], context: Context): Promise<Token[]> {
    if (context.chain === 'cardano') {
      return await client.fetchTokens(
        addresses.map((address) => ({
          chainId: getInternalChainId(context.chain),
          address,
        })),
      );
    }

    const info = await context.ethcallProvider.all(
      addresses.flatMap((address) => {
        const contract = new context.ethcall.Contract(address, erc20Abi);
        return [contract.name(), contract.symbol(), contract.decimals()];
      }),
    );

    return addresses.map((address, idx): Token => {
      const name = info[idx * 3];
      const symbol = info[idx * 3 + 1];
      const decimals = info[idx * 3 + 2];

      return {
        name: name,
        symbol: symbol,
        address: address,
        decimals: decimals,
        displayName: symbol,
        underlying: [],
      } as Token;
    });
  }

  private getMergedUniqueTokenMap(tokens: Token[]) {
    const flat = tokens.flatMap((token) => this.flattenTokenStructure(token));
    return flat.reduce((map, token) => {
      const previous = map.get(token.address);
      if (!previous) {
        return map.set(token.address, token);
      } else {
        return map.set(token.address, {
          ...token,
          displayName: token.displayName || previous.displayName,
          price: token.price || previous.price,
          underlying: token.underlying || previous.underlying,
        });
      }
    }, new Map<Address, Token>());
  }

  private flattenTokenStructure(token: Token): Token[] {
    const under =
      token.underlying?.flatMap((a: Token): Token[] => this.flattenTokenStructure(a)) || [];

    return [
      {
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        name: token.name,
        displayName: token.displayName || token.symbol,
        price: token.price,
        underlying: token.underlying || [],
      },
      ...under,
    ] as Token[];
  }

  async preloadTokens() {
    return Promise.all(this.modules.map((module) => this.preloadModuleTokens(module)));
  }

  async fetchPools() {
    const results = await Promise.allSettled(
      this.modules.map(async (module) => {
        if (this.pools.has(module)) {
          logger.debug(`Returning pool from cache`);
          return this.pools.get(module) as Pool[];
        }

        const context = this.getContextForChain(module.chain);

        const tokens = await this.preloadModuleTokens(module);

        const pools = (await module.fetchPools({ tokens, ...context })).filter(Boolean) as Pool[];

        pools.forEach((pool) => {
          if (pool.supplied?.some((t) => !t.token)) {
            logger.warn(`Supplied tokens missing for pool ${pool.id}`);
          }
          if (pool.rewarded?.some((t) => !t.token)) {
            logger.warn(`Rewarded tokens missing for pool ${pool.id}`);
          }
          if (pool.borrowed?.some((t) => !t.token)) {
            logger.warn(`Borrowed tokens missing for pool ${pool.id}`);
          }
        });

        this.pools.set(module, pools);

        return pools;
      }),
    );

    return results.reduce((acc, cur) => {
      if (cur.status === 'fulfilled') {
        return acc.concat([cur.value]);
      }
      logger.warn(cur.reason);
      return acc;
    }, new Array<Pool[]>());
  }

  async fetchUserPositions(user: Address) {
    logger.debug(`Fetching User Positions - ${user}`);

    if (!this.tokens.size) await this.preloadTokens();
    if (!this.pools.size) await this.fetchPools();

    const positions = await Promise.all(
      this.modules.map(async (module) => {
        const tokens = this.tokens.get(module);
        if (!tokens) throw new Error('Failed to find tokens');
        const pools = this.pools.get(module);
        const context = this.getContextForChain(module.chain);
        if (!pools?.length) {
          return [];
        }

        return module.fetchUserPositions({
          pools,
          user,
          ...context,
        });
      }),
    );

    return positions
      .flat()
      .filter(
        (position) =>
          position &&
          (position.supplied?.some((supply) => supply.balance) ||
            position.rewarded?.some((reward) => reward.balance) ||
            position.borrowed?.some((borrow) => borrow.balance)),
      );
  }
}
