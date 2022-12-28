import type { Call } from 'ethcall';
import type { BigNumber } from 'ethers';

import type {
  Address,
  ComplexAsset,
  ModuleDefinitionInterface,
  UserPosition,
} from '@defiyield/sandbox';
import { chunk } from '@defiyield/utils/array';

import { EXP_SCALE } from '../../common/constants/base.constant';
import comptrollerAbi from './abis/comptroller.abi.json';
import otokenAbi from './abis/otoken.abi.json';

const unitrollerAddress = '0x8849f1a0cB6b5D6076aB150546EddEe193754F1C';
const wmaticAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

export const Lending0Vix: ModuleDefinitionInterface = {
  name: 'Lending',
  chain: 'polygon',
  type: 'lending',

  async preloadTokens({ ethcall, ethcallProvider }) {
    const contract = new ethcall.Contract(unitrollerAddress, comptrollerAbi);

    const [markets] = await ethcallProvider.all([contract.getAllMarkets()]);

    if (!markets) return [];

    return markets as `0x${string}`[];
  },

  async fetchPools({ tokens, ethcallProvider, ethcall }) {
    const contract = new ethcall.Contract(unitrollerAddress, comptrollerAbi);

    const marketsData = await ethcallProvider.all<{ collateralFactorMantissa: BigNumber }>(
      tokens.map((token): Call => contract.markets(token.address)),
    );

    const callsPerPoll = 2;
    const poolsData = chunk(
      await ethcallProvider.all<BigNumber>(
        tokens.flatMap((token): [Call, Call] | [] => {
          // TODO should be fixed, because will not work in next cycle
          if (!token?.address) return [];
          const oTokenContract = new ethcall.Contract(token.address, otokenAbi);

          return [oTokenContract.supplyRatePerTimestamp(), oTokenContract.borrowRatePerTimestamp()];
        }),
      ),
      callsPerPoll,
    );

    return tokens.map((token, idx) => {
      const { collateralFactorMantissa } = marketsData[idx];
      let supplyApr = 0;
      let borrowApr = 0;
      if (token.address) {
        const [supplyRate, borrowRate] = poolsData[idx];
        supplyApr = getTokenApr(supplyRate);
        borrowApr = getTokenApr(borrowRate);
      }

      return {
        id: `${unitrollerAddress}::${token.address}`,
        supplied: [
          {
            token,
            apr: { year: supplyApr },
            ltv: getLtv(collateralFactorMantissa),
          },
        ],
        borrowed: [
          {
            token,
            apr: { year: borrowApr },
          },
        ],
      };
    });
  },

  async fetchUserPositions({ pools, user, ethcall, ethcallProvider }) {
    const contract = new ethcall.Contract(unitrollerAddress, comptrollerAbi);
    const callsPerPoll = 4;

    const userData = chunk(
      await ethcallProvider.all<BigNumber>(
        pools.flatMap((pool): [Call, Call, Call, Call] | [] => {
          const { token } = pool.supplied?.[0] || {};
          if (!token) return [];
          const oTokenContract = new ethcall.Contract(token.address, otokenAbi);

          return [
            oTokenContract.balanceOf(user),
            oTokenContract.borrowBalanceStored(user),
            oTokenContract.exchangeRateStored(),
            contract.accountMembership(token.address, user),
          ];
        }),
      ),
      callsPerPoll,
    );

    return pools.reduce((acc, pool, idx) => {
      const { token, ltv } = pool.supplied?.[0] || {};
      if (!token) return acc;

      const [supplied, borrowed, exchangeRate, isCollateral] = userData[idx];
      if ((supplied?.gt(0) && exchangeRate) || borrowed?.gt(0)) {
        const position: UserPosition = {
          id: pool.id,
          supplied: [],
          borrowed: [],
        };

        if (supplied?.gt(0) && exchangeRate) {
          position.supplied?.push({
            token,
            // TODO do we have here Token or ComplexAsset ?
            balance:
              (+supplied.toString() / 10 ** token.decimals) *
              calculateExchangeRate(token as unknown as ComplexAsset, exchangeRate),
            ltv,
            isCollateral: !!isCollateral,
          });
        }

        if (borrowed?.gt(0)) {
          position.borrowed?.push({
            token,
            balance: +borrowed.toString() / 10 ** token.underlying[0].decimals,
          });
        }

        acc.push(position);
      }

      return acc;
    }, new Array<UserPosition>());
  },

  async fetchMissingTokenDetails({ address, ethcall, ethcallProvider }) {
    const oTokenContract = new ethcall.Contract(address, otokenAbi);
    const [isOToken, name, symbol, decimals, token0] = (await ethcallProvider.tryAll([
      oTokenContract.isOToken(),
      oTokenContract.name(),
      oTokenContract.symbol(),
      oTokenContract.decimals(),
      oTokenContract.underlying(),
    ])) as [boolean, string, string, number, Address];
    if (!isOToken) return;

    return {
      address,
      name,
      symbol,
      decimals,
      underlying: [token0 != null ? token0 : wmaticAddress],
    };
  },
};

const getLtv = (collateralFactor?: BigNumber): number => {
  if (!collateralFactor) return 0;

  return +collateralFactor.toString() / 10 ** EXP_SCALE;
};

const getTokenApr = (rate?: BigNumber): number => {
  if (!rate) return 0;

  return (+rate.toString() * 365 * 24 * 60 * 60) / 10 ** EXP_SCALE;
};

const calculateExchangeRate = (token: ComplexAsset, exchangeRate: BigNumber): number => {
  const mantissa = EXP_SCALE + token.underlying[0].decimals - token.decimals;

  return +exchangeRate.toString() / 10 ** mantissa;
};
