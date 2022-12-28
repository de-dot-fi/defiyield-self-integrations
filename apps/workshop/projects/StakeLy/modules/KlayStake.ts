import type { ModuleDefinitionInterface } from '@defiyield/sandbox';

import stKlayAbi from '../abis/stklay.abi.json';

const stKlayAddress = '0xF80F2b22932fCEC6189b9153aA18662b15CC9C00';

export const KlayStake: ModuleDefinitionInterface = {
  name: 'KlayStake',
  chain: 'klaytn',
  type: 'staking',

  async preloadTokens() {
    return [stKlayAddress];
  },

  async fetchPools({ tokens, ethcallProvider, ethcall, BigNumber, axios }) {
    const [token] = tokens;
    const contract = new ethcall.Contract(stKlayAddress, stKlayAbi);

    const [totalSupply] = await ethcallProvider.all<typeof BigNumber>([contract.totalStaking()]);
    const tvl = (Number(totalSupply.toString()) / 10 ** token?.decimals) * (token?.price || 0);

    let apr = 0;
    try {
      const response = await axios.get('https://stake.ly/api/stats/stKlay/apr');
      if (response.data?.value) apr = response.data.value / 100;
    } catch {}

    return [
      {
        id: stKlayAddress,
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

    const contract = new ethcall.Contract(stKlayAddress, stKlayAbi);

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
