import erc20Abi from '@defiyield/abi/erc20.abi.json';
import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { createMulticallChunker } from '@defiyield/utils/array';
import type { BigNumber } from 'ethers';
import { BigBangABI, ConfigurableInterestVaultConfigABI, VaultABI } from '../abis/abi';
import { BIG_BANG, BLOCKS_PER_YEAR, SINGLE_TOKEN } from '../helpers/constants';
import { findPoolByAddress } from '../helpers/findPoolByAddress';
import { findTokenByAddress } from '../helpers/findTokenByAddress';
import { getAllPools } from '../helpers/getAllPools';
import { getApr } from '../helpers/getApr';
import { getRewardApr } from '../helpers/getRewardApr';
import { getUserLending } from '../helpers/getUserLending';
import { isSFSupportedChain, SFSupportedChain } from '../helpers/types';
import { secondToYearlyInterestRate } from '../helpers/secondToYearlyInterestRate';
import { isSameAddr } from '../helpers/isSameAddress';

export const LendingPools = (chain: SFSupportedChain): ModuleDefinitionInterface => ({
  name: 'SingleFinance',
  chain,
  type: 'lending',

  async preloadTokens({ chain, axios }) {
    if (!isSFSupportedChain(chain)) throw new Error('Unsupported chain: ' + chain);

    const tokens = (await getAllPools(axios, chain)).flatMap((pool) => [
      pool.address,
      pool.token.id,
    ]);

    return [SINGLE_TOKEN[chain], ...tokens];
  },

  async fetchPools({ tokens, BigNumber, axios, ethcallProvider, ethcall }) {
    const multiCall = createMulticallChunker(ethcallProvider);
    const pools = await getAllPools(axios, chain);
    const bigBang = new ethcall.Contract(BIG_BANG[chain], BigBangABI);

    const [totalAllocPoint, singlePerBlock]: [BigNumber, BigNumber] = (await ethcallProvider.all([
      bigBang.totalAllocPoint(),
      bigBang.singlePerBlock(),
    ])) as [BigNumber, BigNumber];

    const multiCallRes = await (async () => {
      const result: [
        BigNumber,
        BigNumber,
        BigNumber,
        number,
        string,
        BigNumber,
        { allocPoint: BigNumber },
        BigNumber,
      ][] = await multiCall(pools, (pool) => {
        const vault = new ethcall.Contract(pool.address, VaultABI);
        const token = new ethcall.Contract(pool.token.id, erc20Abi);

        return [
          vault.totalSupply(),
          vault.totalToken(),
          vault.vaultDebtVal(),
          vault.decimals(),
          vault.config(),
          token.balanceOf(pool.address),
          bigBang.poolInfo(pool.fairLaunchPoolId),
          vault.balanceOf(BIG_BANG[chain]),
        ];
      });

      return result.map(
        ([
          totalSupply,
          totalUnderlyingSupplied,
          totalBorrowed,
          decimals,
          configAddr,
          vaultBalofUnderlying,
          { allocPoint },
          totalIbTokenStaked,
        ]) => ({
          totalSupply,
          totalUnderlyingSupplied,
          totalBorrowed,
          decimals,
          configAddr,
          vaultBalofUnderlying,
          allocPoint,
          totalIbTokenStaked,
        }),
      );
    })();

    const configRes: [BigNumber, BigNumber][] = await multiCall(
      multiCallRes,
      ({ configAddr, totalBorrowed, vaultBalofUnderlying }) => {
        const contract = new ethcall.Contract(configAddr, ConfigurableInterestVaultConfigABI);
        return [
          contract.getInterestRate(totalBorrowed, vaultBalofUnderlying),
          contract.getReservePoolBps(),
        ];
      },
    );

    return pools.map((pool, index) => {
      const {
        totalUnderlyingSupplied,
        totalBorrowed,
        decimals,
        totalIbTokenStaked,
        totalSupply,
        allocPoint,
      } = multiCallRes[index];
      const [interestRate, lendingPerformanceFeeBps] = configRes[index];
      const token = findTokenByAddress(tokens, pool.token.id);
      if (!token) throw new Error('missing token: ' + pool.token.id);
      const single = findTokenByAddress(tokens, SINGLE_TOKEN[chain]);
      if (!single) throw new Error('missing SINGLE token: ' + SINGLE_TOKEN[chain]);

      const lendingPerformanceFee = Number(lendingPerformanceFeeBps) / 10000;

      const lendingBaseYearlyApr = getApr(
        secondToYearlyInterestRate(interestRate),
        Number(totalBorrowed),
        Number(totalUnderlyingSupplied),
        lendingPerformanceFee,
      );

      const conversionRate =
        totalSupply && Number(totalSupply) > 0
          ? Number(totalUnderlyingSupplied) / Number(totalSupply)
          : 1;

      const stakedTvl =
        (Number(totalIbTokenStaked) / Math.pow(10, decimals)) * (token.price || 0) * conversionRate;

      const rewardApr = getRewardApr(
        stakedTvl,
        Number(allocPoint),
        Number(totalAllocPoint),
        Number(singlePerBlock) / Math.pow(10, 18),
        single.price || 0,
        BLOCKS_PER_YEAR[chain],
      );

      return {
        id: pool.address,
        supplied: [
          {
            token,
            tvl: new BigNumber(token.price || 0)
              .times(totalUnderlyingSupplied.toString())
              .dividedBy(10 ** decimals)
              .toNumber(),
            apr: {
              year: lendingBaseYearlyApr,
            },
          },
        ],
        borrowed: [
          {
            token,
            tvl: new BigNumber(token.price || 0)
              .times(totalBorrowed.toString())
              .dividedBy(10 ** decimals)
              .toNumber(),
          },
        ],
        ...(rewardApr > 0
          ? {
              rewarded: [
                {
                  token: single,
                  apr: {
                    year: rewardApr,
                  },
                  tvl: stakedTvl,
                },
              ],
            }
          : {}),
      };
    });
  },

  async fetchUserPositions({ pools, user, axios, BigNumber, ethcall, ethcallProvider }) {
    const multiCall = createMulticallChunker(ethcallProvider);
    const positions = await getUserLending(axios, chain, user);

    const multiCallRes = await (async () => {
      const result: [BigNumber, BigNumber][] = await multiCall(pools, (pool) => {
        const vault = new ethcall.Contract(pool.id, VaultABI);

        return [vault.totalSupply(), vault.totalToken()];
      });
      return result.map(([totalSupply, totalUnderlyingSupplied]) => ({
        totalSupply,
        totalUnderlyingSupplied,
      }));
    })();

    return positions.map(({ ibAmount, stakeAmount, pendingSingle, vault, isCapitalProtected }) => {
      const pool = findPoolByAddress(pools, vault.address);
      if (!pool) return undefined;
      const decimals = vault.decimals;

      const { totalSupply, totalUnderlyingSupplied } =
        multiCallRes[pools.findIndex((p) => isSameAddr(p.id, vault.address))];

      const conversionRate =
        totalSupply && Number(totalSupply) > 0
          ? Number(totalUnderlyingSupplied) / Number(totalSupply)
          : 1;

      return {
        id: pool.id,
        supplied: pool.supplied
          ? pool.supplied.map((p) => ({
              ...p,
              balance: new BigNumber(ibAmount)
                .plus(isCapitalProtected ? 0 : stakeAmount)
                .times(conversionRate)
                .dividedBy(10 ** decimals)
                .toNumber(),
            }))
          : undefined,
        rewarded: pool.rewarded
          ? pool.rewarded.map((p) => ({
              ...p,
              balance: new BigNumber(pendingSingle.bigBang)
                .plus(pendingSingle.boostedBigBang || 0)
                .dividedBy(1e18)
                .toNumber(),
            }))
          : undefined,
      };
    });
  },
});
