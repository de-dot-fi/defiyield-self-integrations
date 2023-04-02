import type {
  ModuleDefinitionInterface,
  SupportedChain,
  TokenDetail,
  TokenExtra,
  UserPosition,
} from '@defiyield/sandbox';
import { getContracts, getContractInfo, getPoolInfo, getBalance, tradingApr } from '../helpers';
import { WHITE_WHALE_POOLS } from '../helpers/config';

export function WhiteWhaleLiquidity(chain: SupportedChain): ModuleDefinitionInterface {
  const currentPool = WHITE_WHALE_POOLS[chain];
  if (!currentPool) {
    throw new Error('Unsupported chain');
  }

  return {
    name: `WhiteWhale Liquidity: ${chain}`,
    chain,
    type: 'pools',

    async preloadTokens(ctx) {
      return await getContracts(currentPool.factory, ctx);
    },

    async fetchMissingTokenDetails(ctx) {
      const info = await getContractInfo(ctx.address, ctx);
      const underlying = info.asset_infos.map(
        (t) => t.native_token?.denom || t.token?.contract_addr,
      );
      if (Array.isArray(underlying)) {
        return <TokenDetail>{
          decimals: 6,
          address: ctx.address,
          underlying,
          metadata: {
            contract: info.liquidity_token,
          },
        };
      }
      return void 0;
    },

    async fetchMissingTokenPrices(ctx): Promise<TokenExtra[]> {
      const tokens: TokenExtra[] = [];
      const { BigNumber } = ctx;

      for await (const asset of ctx.assets) {
        const tokenA = asset.underlying[0];
        const tokenB = asset.underlying[1];

        if (!tokenA?.price || !tokenB?.price) continue;
        const info = await getPoolInfo(asset.address, ctx);

        const totalSupply = new BigNumber(info.total_share) //
          .div(10 ** asset.decimals);
        const reserveA = info.assets.find(
          (t) => (t.info.native_token?.denom || t.info.token?.contract_addr) === tokenA.address,
        );
        const reserveB = info.assets.find(
          (t) => (t.info.native_token?.denom || t.info.token?.contract_addr) === tokenB.address,
        );

        if (!reserveA?.amount || !reserveB?.amount) continue;
        const amountA = new BigNumber(reserveA.amount) //
          .div(10 ** tokenA.decimals);
        const amountB = new BigNumber(reserveB.amount) //
          .div(10 ** tokenB.decimals);

        const tvl = amountA.times(tokenA.price).plus(amountB.times(tokenB.price));
        const price = tvl.div(totalSupply);

        tokens.push({
          address: asset.address,
          price: price.toNumber(),
          underlying: [
            {
              address: tokenA.address,
              reserve: reserveA.amount,
            },
            {
              address: tokenB.address,
              reserve: reserveB.amount,
            },
          ],
          totalSupply: info.total_share,
        });
      }

      return tokens;
    },

    async fetchPools(ctx) {
      const { BigNumber, tokens } = ctx;
      const aprs = await tradingApr(ctx);

      return tokens
        .filter((token) => token.underlying.length === 2)
        .map((token) => {
          const totalSupply = new BigNumber(token.totalSupply || 0);
          const apr = aprs.get(token.address);
          return {
            id: token.address,
            supplied: [
              {
                token,
                tvl: new BigNumber(token?.price ?? 0).times(totalSupply).toNumber(),
                apr: { year: new BigNumber(apr ?? 0).div(100).toNumber() },
              },
            ],
          };
        });
    },

    async fetchUserPositions(ctx) {
      const balances = new Map<string, number>();

      await Promise.all(
        ctx.pools.map(async (pool) => {
          const supply = pool?.supplied?.[0];
          const contract = supply?.token?.metadata?.contract as string;
          if (contract && supply) {
            const balance = await getBalance(contract, ctx);
            balances.set(supply.token.address, balance);
          }
        }),
      );
      if (!balances.size) {
        return [];
      }

      return ctx.pools.reduce((positions, pool) => {
        const supply = pool?.supplied?.[0];
        const rawBalance = supply && balances.get(supply.token.address);
        if (rawBalance && rawBalance > 0) {
          const balance = new ctx.BigNumber(rawBalance).div(10 ** supply.token.decimals).toNumber();
          positions.push({
            id: pool.id,
            supplied: [Object.assign({ balance }, supply)],
          });
        }

        return positions;
      }, [] as UserPosition[]);
    },
  };
}
