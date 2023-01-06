import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
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
    if (!AVAILABLE_POOLS.has(address)) {
      return;
    }

    const underlying = AVAILABLE_POOLS.get(address);
    if (!underlying) {
      return;
    }
    const name = 'Cardano LP';
    return {
      name: name,
      symbol: name,
      address: address,
      decimals: 0,
      displayName: name,
      underlying: [],
    };
  },

  async fetchPools({ tokens, axios, BigNumber }) {
    const {
      data: { pools },
    } = await axios.post('https://amm-api.adax.pro', { endpoint: 'getPools' });

    const adaToken = tokens.find((token) => token.address === CARDANO_COIN_ADDRESS);
    const poolMap = new Map(
      pools.map((pool: any) => [`${ADAX_POLICY}.${pool.pool_nft_name}`, pool]),
    );

    return tokens
      .filter((token) => token.address.startsWith(ADAX_POLICY))
      .map((token) => {
        const pool: any = poolMap.get(token.address);
        const secondToken = tokens.find(
          (token) => token.address === `${pool.asset_b.symbol}.${pool.asset_b.name}`,
        );
        let tvl = new BigNumber(0);
        let price = new BigNumber(0);

        if (adaToken?.price && secondToken?.price) {
          const amountA = new BigNumber(pool.asset_a.amount).div(
            10 ** pool.asset_a.metadata.metadata_decimals,
          );
          const amountB = new BigNumber(pool.asset_b.amount).div(
            10 ** pool.asset_b.metadata.metadata_decimals,
          );

          tvl = amountA.times(adaToken.price).plus(amountB.times(secondToken.price));
          price = tvl.div(pool.pool_lp_amount);
        }
        const newTokenSymbol = `ADA-${secondToken?.displayName}`;

        return {
          id: token.address,
          supplied: [
            {
              token: {
                ...token,
                name: `${newTokenSymbol} LP`,
                symbol: newTokenSymbol,
                displayName: `${newTokenSymbol} LP`,
                price: price.toNumber(),
              },
              tvl: tvl.toNumber(),
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
