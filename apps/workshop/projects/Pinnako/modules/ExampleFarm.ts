import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { jitoStats, plpStats } from '../helpers';
import { Pool, TokenExtra } from '../../../../sandbox/src/types/module';
import erc20Abi from '../abis/erc20.abi.json';
import rewardRouterAbi from '../abis/rewardRouter.abi.json';
import plpMangerAbi from '../abis/plpManger.abi.json';

export const ExampleFarm: ModuleDefinitionInterface = {
  name: 'Pinnako',
  chain: 'zksync_era',
  type: 'staking',

  async preloadTokens() {
    return [
      '0xf8C6dA1bbdc31Ea5F968AcE76E931685cA7F9962',
      '0x8FdF5A1880832e9043Ce35B729A1e6C850b09b23',
    ];
  },

  async fetchPools(ctx) {
    const { axios, tokens, BigNumber, ethcall, ethcallProvider } = ctx;

    const stats = await jitoStats({ axios });
    const jito = tokens.find((t) => t.address === '0x8FdF5A1880832e9043Ce35B729A1e6C850b09b23');
    const piko = tokens.find((t) => t.address === '0xf8C6dA1bbdc31Ea5F968AcE76E931685cA7F9962');
    const tvl = new BigNumber(stats.tvl).div(10 ** 30);

    let apr_PIKO_plp,
      apr_USDC_plp,
      apr = 0;
    try {
      const priceResult = await axios.get(
        'https://api.dexscreener.com/latest/dex/pairs/zksync/0x2f801cc2b7213be05fd73febb80b627cfd625c9f',
      );

      const PIKOPrice = priceResult.data?.pair?.priceUsd;

      const routerContract = new ethcall.Contract(
        '0xeF4B5d85C34F746d024293b364205000C86Bc4Ff',
        rewardRouterAbi,
      );
      const [resData]: any = await ethcallProvider.all([routerContract.stakedPlpnAmount()]);

      const rewardAmount = resData[2] / Math.pow(10, 18);

      const totalShareStaked = resData[1] / Math.pow(10, 18);

      const plpMangerContract = new ethcall.Contract(
        '0xa5D4263E56C17fe33c565f40f183C3F222206744',
        plpMangerAbi,
      );
      const [poolInfo]: any = await ethcallProvider.all([plpMangerContract.getPoolInfo()]);

      const pool = poolInfo;

      const totalSupply = pool[2] / Math.pow(10, 18);

      const PLP_Price = Number(pool[0] / pool[2] / Math.pow(10, 12)).toFixed();

      apr_PIKO_plp =
        (rewardAmount * 3600 * 24 * 365 * PIKOPrice) / Number(PLP_Price) / totalShareStaked;
      apr_USDC_plp = (500 * 365) / (totalSupply * Number(PLP_Price));

      apr = Number(apr_PIKO_plp) + Number(apr_USDC_plp);
    } catch (error) {}

    if (!piko || !jito) {
      return [];
    }
    const vaults: Pool[] = [
      {
        id: piko.address,
        extra: {
          exchangeRate: new BigNumber(0).toString(),
        },
        supplied: [
          {
            token: piko,
            tvl: tvl.toNumber(),
            apr: { year: apr },
          },
        ],
      },
      {
        id: jito.address,
        extra: {
          exchangeRate: new BigNumber(0).toString(),
        },
        supplied: [
          {
            token: jito,
            tvl: tvl.toNumber(),
            apr: { year: apr },
          },
        ],
      },
    ];
    return vaults;
  },

  async fetchUserPositions({ pools, user, ethcall, ethcallProvider, BigNumber }) {
    const [pool] = pools;

    if (!pool.supplied) return [];

    const contract = new ethcall.Contract('0x536D092230A3372030a63414f5932CAD74fC9Db6', erc20Abi);
    const [_balance] = await ethcallProvider.all<typeof BigNumber>([contract.balanceOf(user)]);
    const balance = Number(_balance.toString()) / 10 ** 18;

    return [
      {
        id: pool.id,
        supplied: [
          {
            ...pool.supplied[0],
            balance,
          },
        ],
      },
    ];
  },

  async fetchMissingTokenPrices(ctx) {
    const { axios } = ctx;

    let PIKOPrice,
      plpPrice = 0;
    try {
      const priceResult = await axios.get(
        'https://api.dexscreener.com/latest/dex/pairs/zksync/0x2f801cc2b7213be05fd73febb80b627cfd625c9f',
      );
      PIKOPrice = priceResult.data?.pair?.priceUsd;
      const stats = await plpStats({ axios });
      plpPrice = Number(stats.plpPrice.toFixed(4));
    } catch (error) {}
    const TokenValue: TokenExtra[] = [
      {
        address: '0xf8C6dA1bbdc31Ea5F968AcE76E931685cA7F9962',
        price: PIKOPrice,
      },
      {
        address: '0x8FdF5A1880832e9043Ce35B729A1e6C850b09b23',
        price: plpPrice,
      },
    ];

    return TokenValue;
  },
};
