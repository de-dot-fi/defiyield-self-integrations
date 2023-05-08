import { Context, Token } from '@defiyield/sandbox';
import { BigNumber } from 'ethers';
import {
  CONTRACTS,
  FARM_REWARD,
  MOONBEAM_AVERAGE_BLOCK_TIME,
  POOLS,
  SUBGRAPH_ENDPOINTS,
  SUBGRAPH_QUERIES,
} from './constants';
import { subgraph } from './gql';
import {
  getAprProps,
  getDualRewardRoiPerYearProps,
  getFarmIDProps,
  getFetchPoolsPromisesProps,
  getPoolsProps,
  getSingleStellaDistributorsProps,
  getStellaDistributorsProps,
  getTvlProps,
  STELLA_DISTRIBUTOR_RESPONSE,
  STELLA_DUAL_DISTRIBUTOR_RESPONSE,
} from './types';
import STELLA_DISTRIBUTOR_ABI from '../abis/stella-distributor.json';
import STELLA_DUAL_DISTRIBUTOR_ABI from '../abis/stella-dual-distributor.json';

export const getDayGapInSeconds = (day = 1) =>
  Math.floor((new Date().getTime() - day * 24 * 60 * 60 * 1000) / 1000);

const zip = (arrays: any[][]) => {
  return arrays[0].map((_, i) => {
    return arrays.map((array) => {
      return array[i];
    });
  });
};

const getTradingFeeAprs = async (ctx: Context, poolAddresses: string[]) => {
  const tradingFeeAprs: Record<string, number> = {};

  const res = await Promise.all([
    subgraph<{ pairDayDatas: any }>(
      ctx,
      SUBGRAPH_ENDPOINTS.STELLA,
      'getPairDayDatas',
      SUBGRAPH_QUERIES.STELLA.pairDayData(
        poolAddresses,
        getDayGapInSeconds(2),
        getDayGapInSeconds(1),
      ),
    ),
    subgraph<{ pairDayDatas: any }>(
      ctx,
      SUBGRAPH_ENDPOINTS.STELLA,
      'getPairDayDatas',
      SUBGRAPH_QUERIES.STELLA.pairDayData(
        poolAddresses,
        getDayGapInSeconds(4),
        getDayGapInSeconds(3),
      ),
    ),
    subgraph<{ pairDayDatas: any }>(
      ctx,
      SUBGRAPH_ENDPOINTS.STELLA,
      'getPairDayDatas',
      SUBGRAPH_QUERIES.STELLA.pairDayData(
        poolAddresses,
        getDayGapInSeconds(6),
        getDayGapInSeconds(5),
      ),
    ),
  ]);
  const zippedRes = zip([
    res?.[0]?.pairDayDatas || [],
    res?.[1]?.pairDayDatas || [],
    res?.[2]?.pairDayDatas || [],
  ]);

  for (const pairDayData of zippedRes) {
    if (pairDayData && pairDayData?.[0] && pairDayData?.[1] && pairDayData?.[2]) {
      const pairAddress: string = pairDayData?.[0]?.id.split('-')?.[0]?.toLowerCase();

      const vol0 = pairDayData[0].dailyVolumeUSD;
      const vol1 = pairDayData[1].dailyVolumeUSD;
      const vol2 = pairDayData[2].dailyVolumeUSD;

      const reserve0 = pairDayData[0].reserveUSD;
      const reserve1 = pairDayData[1].reserveUSD;
      const reserve2 = pairDayData[2].reserveUSD;

      const avgVol = (+vol0 + +vol1 + +vol2) / 3;
      const avgReserve = (+reserve0 + +reserve1 + +reserve2) / 3;

      tradingFeeAprs[pairAddress] = (+avgVol * 0.0025 * 365) / +avgReserve;
    }
  }
  return tradingFeeAprs;
};

const getTradingFeeAprStable = async (ctx: Context, poolInfo: [string, number, number][]) => {
  const pairAddressToAprMap: Record<string, number> = {};
  const liquidityProviderFee = 0.0004;

  const res = await Promise.all([
    subgraph<{ swaps: any }>(
      ctx,
      SUBGRAPH_ENDPOINTS.STABLE,
      'getStablesWeeklyVolume',
      SUBGRAPH_QUERIES.STABLE.stablesWeeklyVolume(poolInfo.map((el) => el[0].toLowerCase())),
    ),
    subgraph<{ swaps: any }>(
      ctx,
      SUBGRAPH_ENDPOINTS.STABLE2,
      'getStablesWeeklyVolume',
      SUBGRAPH_QUERIES.STABLE.stablesWeeklyVolume(poolInfo.map((el) => el[0].toLowerCase())),
    ),
  ]);
  const mergedRes = [...(res?.[0]?.swaps || []), ...(res?.[1]?.swaps || [])];

  for (const data of mergedRes) {
    const targetPool = poolInfo?.find((el) => el?.[0]?.toLowerCase() === data?.id?.toLowerCase());
    if (targetPool) {
      const tokenPrice = targetPool?.[1] || 0;
      const weeklyVolume = new ctx.BigNumber(data?.weeklyVolumes?.[0]?.volume || 0);

      const liq = +targetPool[2] / 10 ** 18;
      const fees = (+weeklyVolume / 7) * +liquidityProviderFee;
      const feesInUsd = fees * tokenPrice;
      const feesPerYear = feesInUsd * 365;
      const APR = feesPerYear / liq;

      pairAddressToAprMap[data?.lpToken] = +APR;
    }
  }

  return pairAddressToAprMap;
};

export const getStellaDistributors = async ({
  ctx,
  stellaDistributorPoolLength,
  stellaDualDistributorPoolLength,
}: getStellaDistributorsProps) => {
  const { ethcall, ethcallProvider } = ctx;

  const stellaDistributorContract = new ethcall.Contract(
    CONTRACTS.STELLA_DISTRIBUTOR,
    STELLA_DISTRIBUTOR_ABI,
  );
  const stellaDualDistributorContract = new ethcall.Contract(
    CONTRACTS.STELLA_DUAL_DISTRIBUTOR,
    STELLA_DUAL_DISTRIBUTOR_ABI,
  );

  const stellaDistributorPoolIDs = [...Array(+stellaDistributorPoolLength).keys()].map(
    (pid) => +pid,
  );
  const stellaDualDistributorPoolIDs = [...Array(+stellaDualDistributorPoolLength).keys()].map(
    (pid) => +pid,
  );

  const [stellaDistributorPoolInfo, stellaDualDistributorPoolInfo] = await Promise.all([
    ethcallProvider.all<STELLA_DISTRIBUTOR_RESPONSE>([
      ...stellaDistributorPoolIDs.map((id) => stellaDistributorContract.poolInfo(id)),
    ]),
    ethcallProvider.all<STELLA_DUAL_DISTRIBUTOR_RESPONSE>([
      ...stellaDualDistributorPoolIDs.map((id) => stellaDualDistributorContract.poolInfo(id)),
    ]),
  ]);

  const stellaDistributorResults = stellaDistributorPoolInfo.map((poolInfo) => ({
    lpToken: poolInfo.lpToken,
    totalLp: +poolInfo.totalLp,
    allocPoint: +poolInfo.allocPoint,
  }));
  const stellaDualDistributorResults = stellaDualDistributorPoolInfo.map((poolInfo) => ({
    lpToken: poolInfo.lpToken,
    totalLp: +poolInfo.totalLp,
    allocPoint: +poolInfo.allocPoint,
    stellaPerSec: +poolInfo.stellaPerSec,
  }));

  return {
    stellaDistributorResults,
    stellaDualDistributorResults,
  };
};

const getPools = ({ tokens, stellaDualDistributorResults, ethPrice }: getPoolsProps) => {
  const singleRewardPools: string[] = [];
  const dualRewardPools: string[] = [];
  const stablePools: [string, number, number][] = [];

  for (const token of tokens) {
    const staticTokenData = POOLS?.[token.address];
    const isSingleReward = staticTokenData?.farmReward === FARM_REWARD.SINGLE;
    const isDualReward = staticTokenData?.farmReward === FARM_REWARD.DUAL;
    const stableContract = staticTokenData?.stableContract;
    if (isSingleReward) singleRewardPools.push(token.address.toLowerCase());
    if (isDualReward) dualRewardPools.push(token.address.toLowerCase());
    if (stableContract) {
      const stellaDualDistributor = stellaDualDistributorResults.find(
        (el) => el.lpToken.toLowerCase() === token.address.toLowerCase(),
      );
      stablePools.push([
        stableContract.toLowerCase(),
        (staticTokenData?.ignoreLpPrice ? 1 : ethPrice) || 0,
        stellaDualDistributor?.totalLp || 0,
      ]);
    }
  }

  return {
    singleRewardPools,
    dualRewardPools,
    stablePools,
  };
};

const getFarmID = ({ token, stellaDualDistributorResults }: getFarmIDProps) => {
  return stellaDualDistributorResults.findIndex(
    (el) => el.lpToken.toLowerCase() === token.address.toLowerCase(),
  );
};

const getSingleStellaDistributors = ({
  token,
  farmID,
  stellaDistributorResults,
  stellaDualDistributorResults,
}: getSingleStellaDistributorsProps) => {
  const stellaDistributor = stellaDistributorResults.find(
    (el) => el.lpToken.toLowerCase() === token.address.toLowerCase(),
  );
  const stellaDualDistributor = stellaDualDistributorResults[farmID];
  return { stellaDistributor, stellaDualDistributor };
};

const getTVL = ({
  token,
  staticTokenData,
  stellaDistributor,
  stellaDualDistributor,
}: getTvlProps) => {
  const { ignoreLpPrice } = staticTokenData || {};
  const lpPrice = ignoreLpPrice ? 1 : token?.price || 0;
  const totalLp = staticTokenData
    ? stellaDualDistributor?.totalLp || stellaDistributor?.totalLp || 0
    : 0;
  return (+totalLp / 10 ** token.decimals) * lpPrice;
};

const getDualRewardRoiPerYear = async ({
  ctx,
  farmID,
  token,
  staticTokenData,
  tradingFeeAPRsOfDualFarms,
  tradingFeeAPRsOfStableDualFarms,
  stellaDualDistributor,
  totalAllocPoint,
  stellaPerSec,
  tvl,
}: getDualRewardRoiPerYearProps) => {
  const { ethcallProvider, ethcall } = ctx;

  const stellaDualDistributorContract = new ethcall.Contract(
    CONTRACTS.STELLA_DUAL_DISTRIBUTOR,
    STELLA_DUAL_DISTRIBUTOR_ABI,
  );

  const tradingFeeApr = staticTokenData?.stableContract
    ? tradingFeeAPRsOfStableDualFarms?.[token.address.toLowerCase()]
    : tradingFeeAPRsOfDualFarms?.[token.address.toLowerCase()] || 0;

  const tradingAPR = +tradingFeeApr || 0;

  const rewards = await ethcallProvider.all<{
    addresses: string[];
    symbols: string[];
    decimals: BigNumber[];
    rewardsPerSec: BigNumber[];
  }>([stellaDualDistributorContract.poolRewardsPerSec(farmID)]);

  const rewardsPrice = await Promise.all(
    rewards?.[0]?.addresses?.map((el) =>
      subgraph<{ tokenDayDatas: any }>(
        ctx,
        SUBGRAPH_ENDPOINTS.STELLA,
        'getTokenPrice',
        SUBGRAPH_QUERIES.STELLA.getTokenPrice(el.toLowerCase()),
      ),
    ),
  );

  const secondsInOneYear = 86400 * 365;
  const farmAPR =
    +(
      rewardsPrice.reduce((acc, curr) => {
        const rewardTokenID = curr.tokenDayDatas[0].token.id;
        const targetIndex = rewards?.[0]?.addresses?.findIndex(
          (el) => el.toLowerCase() === rewardTokenID.toLowerCase(),
        );
        const rewardsPerSec =
          rewards?.[0]?.symbols?.[targetIndex] === 'STELLA'
            ? ((stellaDualDistributor?.allocPoint || 0) / +totalAllocPoint) * +stellaPerSec
            : +rewards?.[0]?.rewardsPerSec[targetIndex];
        return (
          acc +
          ((rewardsPerSec * secondsInOneYear) / 10 ** +rewards?.[0]?.decimals?.[targetIndex]) *
            +curr.tokenDayDatas[0].priceUSD
        );
      }, 0) / tvl
    ) || 0;

  return +tradingAPR + +farmAPR;
};

const getAPR = async ({
  ctx,
  farmID,
  token,
  staticTokenData,
  tradingFeeAprs,
  tradingFeeAPRsOfDualFarms,
  tradingFeeAPRsOfStableDualFarms,
  stellaDistributor,
  stellaDualDistributor,
  totalAllocPoint,
  stellaPerSec,
  tvl,
  stellaPrice,
}: getAprProps) => {
  const { ethcallProvider, ethcall } = ctx;
  const { farmReward } = staticTokenData || {};

  const stellaDistributorContract = new ethcall.Contract(
    CONTRACTS.STELLA_DISTRIBUTOR,
    STELLA_DISTRIBUTOR_ABI,
  );

  let apr = 0;
  if (farmReward === FARM_REWARD.DUAL) {
    apr = await getDualRewardRoiPerYear({
      ctx,
      farmID,
      token,
      staticTokenData,
      tradingFeeAPRsOfDualFarms,
      tradingFeeAPRsOfStableDualFarms,
      stellaDualDistributor,
      totalAllocPoint,
      stellaPerSec,
      tvl,
    });
  } else {
    const blocksPerHour = 3600 / MOONBEAM_AVERAGE_BLOCK_TIME;

    const [stellaPerBlock, totalAllocPoint] = await ethcallProvider.all<BigNumber>([
      stellaDistributorContract.stellaPerBlock(),
      stellaDistributorContract.totalAllocPoint(),
    ]);
    const rewardPerBlock =
      (((stellaDistributor?.allocPoint || 0) / +totalAllocPoint) * +stellaPerBlock) / 10 ** 18;

    const validatedTvl = tvl === 0 ? 1 : tvl;
    const roiPerBlock = (rewardPerBlock * stellaPrice) / validatedTvl;
    const roiPerHour = roiPerBlock * blocksPerHour;
    const roiPerDay = roiPerHour * 24;
    const roiPerYear = roiPerDay * 365;
    const farmAPR = +roiPerYear - +roiPerYear * 0.15;

    const tradingFeeApr = tradingFeeAprs[token.address.toLowerCase()] || 0;
    const totalAPR = +farmAPR + +tradingFeeApr;
    apr = totalAPR;
  }

  return apr;
};

export const getContractParams = async (ctx: Context, tokens: Token[], ethPrice: number) => {
  const { ethcall, ethcallProvider } = ctx;

  const stellaDistributorContract = new ethcall.Contract(
    CONTRACTS.STELLA_DISTRIBUTOR,
    STELLA_DISTRIBUTOR_ABI,
  );
  const stellaDualDistributorContract = new ethcall.Contract(
    CONTRACTS.STELLA_DUAL_DISTRIBUTOR,
    STELLA_DUAL_DISTRIBUTOR_ABI,
  );

  const [
    stellaDistributorPoolLength,
    stellaDualDistributorPoolLength,
    stellaPerSec,
    totalAllocPoint,
  ] = await ethcallProvider.all<BigNumber>([
    stellaDistributorContract.poolLength(),
    stellaDualDistributorContract.poolLength(),
    stellaDualDistributorContract.stellaPerSec(),
    stellaDualDistributorContract.totalAllocPoint(),
  ]);

  const { stellaDistributorResults, stellaDualDistributorResults } = await getStellaDistributors({
    ctx,
    stellaDistributorPoolLength,
    stellaDualDistributorPoolLength,
  });
  const { singleRewardPools, dualRewardPools, stablePools } = getPools({
    tokens,
    stellaDualDistributorResults,
    ethPrice,
  });

  const [tradingFeeAprs, tradingFeeAPRsOfDualFarms, tradingFeeAPRsOfStableDualFarms] =
    await Promise.all([
      getTradingFeeAprs(ctx, singleRewardPools),
      getTradingFeeAprs(ctx, dualRewardPools),
      getTradingFeeAprStable(ctx, stablePools),
    ]);

  return {
    stellaPerSec,
    totalAllocPoint,
    stellaDistributorResults,
    stellaDualDistributorResults,
    tradingFeeAprs,
    tradingFeeAPRsOfDualFarms,
    tradingFeeAPRsOfStableDualFarms,
  };
};

export const getFetchPoolsPromises = ({
  ctx,
  tokens,
  stellaDistributorResults,
  stellaDualDistributorResults,
  tradingFeeAprs,
  tradingFeeAPRsOfDualFarms,
  tradingFeeAPRsOfStableDualFarms,
  totalAllocPoint,
  stellaPerSec,
  stellaPrice,
}: getFetchPoolsPromisesProps) => {
  return tokens.map(async (token) => {
    const staticTokenData = POOLS?.[token.address];
    const farmID = getFarmID({ token, stellaDualDistributorResults });
    const { stellaDistributor, stellaDualDistributor } = getSingleStellaDistributors({
      token,
      farmID,
      stellaDistributorResults,
      stellaDualDistributorResults,
    });

    const tvl = getTVL({
      token,
      staticTokenData,
      stellaDistributor,
      stellaDualDistributor,
    });
    const apr = await getAPR({
      ctx,
      farmID,
      token,
      staticTokenData,
      tradingFeeAprs,
      tradingFeeAPRsOfDualFarms,
      tradingFeeAPRsOfStableDualFarms,
      stellaDistributor,
      stellaDualDistributor,
      totalAllocPoint,
      stellaPerSec,
      tvl,
      stellaPrice,
    });

    return {
      id: token.address,
      supplied: [
        {
          token,
          tvl,
          apr: { year: apr },
        },
      ],
    };
  });
};
