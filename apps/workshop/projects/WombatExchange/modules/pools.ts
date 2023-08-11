import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { Address, Pool as DefiyieldPool, SupportedChain, Token } from '@defiyield/sandbox';
import { getTokensData, getPoolsData, Pool, Asset } from '../helpers/index';
import {
  FetchUserPositionsContext,
  UserPosition,
  UserSupplied,
} from '../../../../sandbox/src/types/module';
import pairAbi from '../abis/pair.abi.json';

async function processPool(
  context: FetchUserPositionsContext,
  poolData: Pool,
  positions: UserPosition[],
) {
  const { pools } = context;
  const { assets } = poolData;
  const pool: DefiyieldPool | undefined = pools.find(
    (_p) => _p.id.toLowerCase() === poolData.id.toLowerCase(),
  );

  if (assets.length && pool) {
    await Promise.all(
      assets.map(async (asset) => {
        await processAsset(context, asset, pool, positions);
      }),
    );
  }
}

async function processAsset(
  context: FetchUserPositionsContext,
  asset: Asset,
  pool: DefiyieldPool,
  positions: UserPosition[],
) {
  const { user, ethcall, ethcallProvider, ethers } = context;
  const lpTokenContract = new ethcall.Contract(asset.id, pairAbi);
  const [balance] = (await ethcallProvider.all([lpTokenContract.balanceOf(user)])) as [BigNumber];

  if (balance.gt(BigNumber.from(0))) {
    const supply = pool.supplied
      ? pool.supplied.find(
          (t) => t.token.address.toLowerCase() === asset.underlyingToken.id.toLowerCase(),
        )
      : undefined;

    const token =
      supply?.token ||
      ({
        address: asset.underlyingToken.id,
        displayName: asset.underlyingToken.name,
        decimals: Number(asset.underlyingToken.decimals),
        price: Number(asset.underlyingToken.price),
        underlying: [],
      } as Token);

    positions.push({
      id: asset.poolAddress,
      supplied: [
        {
          token,
          balance: parseFloat(ethers.utils.formatUnits(balance, 18)),
        } as UserSupplied,
      ],
    } as UserPosition);
  }
}

export function getPools(chain: SupportedChain): ModuleDefinitionInterface {
  return {
    name: `Wombat pool: ${chain}`,
    chain,
    type: 'pools',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @returns Address[]
     */
    async preloadTokens(context): Promise<Address[]> {
      return await getTokensData(context, chain);
    },

    /**
     * Returns full pool list
     *
     * @param context
     * @returns Pool[]
     */
    async fetchPools(context): Promise<DefiyieldPool[]> {
      const { tokens } = context;
      const pools: DefiyieldPool[] = [];

      // const assets = await getAssetsData(context, chain);
      // assets.map((a) => {
      //   const _token = tokens.find(
      //     (t) => t.address.toLowerCase() === a.underlyingToken.id.toLowerCase(),
      //   );
      //   const token =
      //     _token ??
      //     ({
      //       address: a.underlyingToken.id,
      //       displayName: a.underlyingToken.name,
      //       decimals: Number(a.underlyingToken.decimals),
      //       price: Number(a.underlyingToken.price),
      //       underlying: [],
      //     } as Token);

      //   pools.push({
      //     id: a.id,
      //     supplied: [
      //       {
      //         token,
      //         tvl: Number(a.tvlUSD),
      //         apr: { year: Number(a.womBaseApr) },
      //       },
      //     ],
      //   });
      // });

      const poolsData = await getPoolsData(context, chain);
      poolsData.map((p: Pool) => {
        const assets = p.assets;
        const suppliedTokens = [];

        if (assets.length) {
          for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const _token = tokens.find(
              (t: Token) => t.address.toLowerCase() === asset.underlyingToken.id.toLowerCase(),
            );
            const token =
              _token ??
              ({
                address: asset.underlyingToken.id,
                displayName: asset.underlyingToken.name,
                decimals: Number(asset.underlyingToken.decimals),
                price: Number(asset.underlyingToken.price),
                underlying: [],
              } as Token);

            suppliedTokens.push({
              token,
              tvl: Number(asset.tvlUSD),
              apr: { year: Number(asset.womBaseApr) },
            });
          }

          pools.push({
            id: p.id,
            supplied: suppliedTokens,
          });
        }
      });

      return pools;
    },

    /**
     * Returns user positions for all pools
     *
     * @param context Context
     * @returns UserPosition[]
     */
    async fetchUserPositions(context): Promise<(void | UserPosition)[]> {
      const positions: UserPosition[] = [];
      const { pools, user, ethcall, ethcallProvider, ethers } = context;

      const poolsData = await getPoolsData(context, chain);

      for (const p of poolsData) {
        await processPool(context, p, positions);
      }

      return positions;
    },
  };
}
