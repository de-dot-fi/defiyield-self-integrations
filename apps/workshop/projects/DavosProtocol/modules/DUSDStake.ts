import type { ModuleDefinitionInterface } from '@defiyield/sandbox';

import stDUSDAbi from '../abis/stDUSD.abi.json';

const stDUSDAddress = '0xe69a1876bdacfa7a7a4f6d531be2fde843d2165c';

export const DUSDStake: ModuleDefinitionInterface = {
  name: 'DUSDStake',
  chain: 'polygon',
  type: 'staking',

  async preloadTokens() {
    return [stDUSDAddress];
  },

  async fetchPools({ tokens, ethcallProvider, ethcall, BigNumber, axios }) {
    const [token] = tokens;
    const contract = new ethcall.Contract(stDUSDAddress, stDUSDAbi);

    const [totalSupply] = await ethcallProvider.all<typeof BigNumber>([contract.totalStaking()]);
    const tvl = (Number(totalSupply.toString()) / 10 ** token?.decimals) * (token?.price || 0);

    let apr = 0;
    try {
      const response = await axios.get('https://stake.ly/api/stats/stDUSD/apr');
      if (response.data?.value) apr = response.data.value / 100;
    } catch {}

    return [
      {
        id: stDUSDAddress,
        supplied: [
          {
            token: tokens[0],
            tvl,
            apr: { year: apr },
          },
        ],
      },
    ];
  },

  async fetchUserPositions({ pools, user, ethcall, ethcallProvider, BigNumber }) {
    const [pool] = pools;
    const { token } = pool.supplied?.[0] || {};
    if (!token) return [];

    const contract = new ethcall.Contract(stDUSDAddress, stDUSDAbi);

    const [balance] = await ethcallProvider.all<typeof BigNumber>([contract.balanceOf(user)]);

    return [
      {
        id: pool.id,
        supplied: [
          {
            token,
            balance: token?.decimals && balance ? +balance.toString() / 10 ** token.decimals : 0,
          },
        ],
      },
    ];
  },
};
