import {
  FetchUserPositionsContext,
  UserPosition,
  PoolSupplied,
  PoolRewarded,
  UserSupplied,
} from './../../../../sandbox/src/types/module';

import {
  COMPOSITION_TOKENS,
  PLP_STAKING_ADDR,
  PLP_STAKING_REVENUE_ADDR,
  PLP_TOKEN_ADDR,
  POOL_DIAMOND_ADDR,
} from './../helpers/config';
import { createMulticallChunker } from '@defiyield/utils/array';
import type { FetchPoolsContext, ModuleDefinitionInterface } from '@defiyield/sandbox';
import { tokenAddresses } from '../helpers/config';
import GetterFacetAbi from '../abis/GetterFacet.json';
import PLPStakingAbi from '../abis/PLPStaking.json';
import FeedableRewarderAbi from '../abis/FeedableRewarder.json';

import type { BigNumber } from 'ethers';
import { calAPR, toFixed } from '../helpers/calculation';

export const PLPStaking: ModuleDefinitionInterface = {
  name: 'PLPStaking',
  chain: 'polygon',
  type: 'staking',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens() {
    return tokenAddresses;
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools(ctx: FetchPoolsContext) {
    const { tokens, ethcall, ethcallProvider, ethers } = ctx;
    const Zero = ethers.BigNumber.from('0');

 
    const multiCall = createMulticallChunker(ethcallProvider);

    const apr = await calAPR(ctx);

    const multiCallRes = await multiCall(Object.values(COMPOSITION_TOKENS), (token) => {
      const contract = new ethcall.Contract(POOL_DIAMOND_ADDR, GetterFacetAbi);
      return [contract.liquidityOf(token)];
    });

    const tokenAddrs = Object.values(COMPOSITION_TOKENS);

    if (tokenAddrs.length !== multiCallRes.length) {
      throw new Error(`Invalid Multicall Result`);
    }

    let mapAddrWithResult: Record<string,BigNumber> = {};
    for (let i = 0; i < Object.values(COMPOSITION_TOKENS).length; i++) {
      mapAddrWithResult[tokenAddrs[i].toLowerCase()] = ethers.BigNumber.from(multiCallRes[i].toString());
    }

    const plpToken = tokens.find((i) => i.address.toLowerCase() === PLP_TOKEN_ADDR.toLowerCase());
    
    const usdcToken = tokens.find(
      (i) => i.address.toLowerCase() === COMPOSITION_TOKENS.USDC.toLowerCase(),
    );


    const tvlBN = Object.keys(mapAddrWithResult).reduce((accum, addr) => {
      const _token = tokens.find(i => i.address.toLowerCase() === addr)

      if (!_token || !_token.price || !_token.decimals) {
        throw new Error(`Invalid Token data`)
      }
      
      
      const tvlTokenBN = mapAddrWithResult[addr]
      .mul(ethers.utils.parseEther(_token.price.toString()))
        .div(ethers.utils.parseUnits('1', _token.decimals));

      return accum.add(tvlTokenBN)

    }, Zero)

    const poolSupplied: PoolSupplied[] = [
      {
        token: plpToken,
        apr: {
          year: parseFloat(toFixed(apr)) / 100, //defiyield apr need to display value * 100
        },
        tvl: parseFloat(ethers.utils.formatEther(tvlBN)),
      } as PoolSupplied,
    ];

    const poolRewarded: PoolRewarded[] = [
      {
        token: usdcToken,
      } as PoolRewarded,
    ];

    return [
      {
        id: 'PLP POOL',
        supplied: poolSupplied,
        rewarded: poolRewarded,
      },
    ];
  },

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions(ctx: FetchUserPositionsContext): Promise<(UserPosition | void)[]> {
    const { ethcall, ethcallProvider, user, pools, ethers } = ctx;

    const plpStakingContract = new ethcall.Contract(PLP_STAKING_ADDR, PLPStakingAbi);
    const rewardContract = new ethcall.Contract(PLP_STAKING_REVENUE_ADDR, FeedableRewarderAbi);


    const multiCallRes: BigNumber[] = (await ethcallProvider.all([
      plpStakingContract.getUserTokenAmount(PLP_TOKEN_ADDR, user),
      rewardContract.pendingReward(user),
      ])) as BigNumber[];


    const [plpBalance, pendingReward]= multiCallRes;


    let plpPoolSupplied: UserSupplied | undefined;
    if (pools[0] != null && pools[0].supplied?.[0] != null) {
      plpPoolSupplied = {
        ...pools[0].supplied[0],
        token: {
          ...pools[0].supplied[0].token,
          underlying: []
        },
        balance: parseFloat(ethers.utils.formatEther(plpBalance)),
      };
    }

    const plpPoolRewarded =
      pools.length === 0 || pools[0].rewarded?.length === 0
        ? undefined
        : {
          ...pools[0].rewarded![0],
          balance: parseFloat(ethers.utils.formatUnits(pendingReward, 6)), //USDC REWARD
        };

    return [
      {
        id: 'PLP POOL User Staking',
        supplied: plpPoolSupplied ? [plpPoolSupplied] : undefined,
        rewarded: plpPoolRewarded ? [plpPoolRewarded] : undefined,
      },
    ];
  },
};
