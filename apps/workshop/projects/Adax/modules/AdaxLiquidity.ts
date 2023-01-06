import type { ModuleDefinitionInterface, TokenDetail, TokenExtra } from '@defiyield/sandbox';
import { CARDANO_COIN_ADDRESS } from '../../../common/constants/cardano.constants';
import { ADAX_POLICY, AVAILABLE_POOLS } from '../helpers/constants';
import { accountAssets } from '../helpers/queries';

export const AdaxLiquidity: ModuleDefinitionInterface = {
  name: 'AdaxLiquidity',
  chain: 'cardano',
  type: 'pools',

  async preloadTokens() {
    const contacts = Array.from(AVAILABLE_POOLS.keys());
    const assets = Array.from(AVAILABLE_POOLS.values());

    return contacts.concat(...assets);
  },

  async fetchMissingTokenDetails({ address }) {
    const underlying = AVAILABLE_POOLS.get(address);
    if (Array.isArray(underlying)) {
      return <TokenDetail>{
        decimals: 0,
        address,
        underlying,
      };
    }
    return void 0;
  },

  async fetchMissingTokenPrices({ assets, axios, BigNumber, allAssets }) {
    const {
      data: { pools },
    } = await axios.post('https://amm-api.adax.pro', { endpoint: 'getPools' });

    const adaToken = allAssets.find((token) => token.address === CARDANO_COIN_ADDRESS);
    const poolMap = new Map(
      pools.map((pool: any) => [`${ADAX_POLICY}.${pool.pool_nft_name}`, pool]),
    );

    return assets
      .filter((token) => token.address.startsWith(ADAX_POLICY))
      .map((token) => {
        const pool: any = poolMap.get(token.address);
        const secondTokenAddress = `${pool.asset_b.symbol}.${pool.asset_b.name}`;
        const secondToken = allAssets.find((token) => token.address === secondTokenAddress);
        let tvl = new BigNumber(0);
        let price = new BigNumber(0);

        if (adaToken!.price && secondToken!.price) {
          const amountA = new BigNumber(pool.asset_a.amount).div(
            10 ** pool.asset_a.metadata.metadata_decimals,
          );
          const amountB = new BigNumber(pool.asset_b.amount).div(
            10 ** pool.asset_b.metadata.metadata_decimals,
          );

          tvl = amountA.times(adaToken!.price).plus(amountB.times(secondToken!.price));
          price = tvl.div(pool.pool_lp_amount);
        }

        return {
          address: token.address,
          price: price.toNumber(),
          underlying: [
            {
              address: CARDANO_COIN_ADDRESS,
              reserve: Number(pool.asset_a.amount).toString(),
            },
            {
              address: secondTokenAddress,
              reserve: Number(pool.asset_b.amount).toString(),
            },
          ],
          totalSupply: Number(pool.pool_lp_amount).toString(),
        };
      });
  },

  async fetchPools({ tokens, BigNumber }) {
    return tokens
      .filter((token) => token.address.startsWith(ADAX_POLICY))
      .map((token) => {
        return {
          id: token.address,
          supplied: [
            {
              token: {
                ...token,
              },
              tvl: new BigNumber(token?.price || 0).times(token?.totalSupply || 0).toNumber(),
            },
          ],
        };
      });
  },

  async fetchUserPositions({ pools, user, axios, cardano }) {
    const stakeAddress = cardano.getStakeAddress(user);
    if (!stakeAddress) {
      return [];
    }
    const { asset_list } = await accountAssets(axios, stakeAddress);
    const poolMap = new Map(pools.map((pool) => [pool.id, pool]));
    if (asset_list?.length) {
      return asset_list.reduce((acc: any, asset: any) => {
        const assetId = `${asset.policy_id}.${asset.asset_name}`;
        const pool = poolMap.get(assetId);
        if (pool) {
          const balance = Number(asset.quantity) / 10 ** pool.supplied![0].token.decimals;
          const supply = Object.assign({ balance }, pool.supplied![0]);
          acc.push({
            id: pool.id,
            supplied: [supply],
          });
        }

        return acc;
      }, []);
    }

    return [];
  },
};
