import { POOL_TYPE, TOKEN_TYPE } from './types';

export const CONTRACTS = {
  STELLA_DISTRIBUTOR: '0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E',
  STELLA_DUAL_DISTRIBUTOR: '0xF3a5454496E26ac57da879bf3285Fa85DEBF0388',
};

export enum FARM_REWARD {
  SINGLE,
  DUAL,
}

export const TOKENS: Record<string, TOKEN_TYPE> = {
  '0xAcc15dC74880C9944775448304B263D191c6077F': {
    label: 'GLMR',
  },
  '0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2': {
    label: 'STELLA',
  },
  '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f': {
    label: 'ETH',
  },
};

export const POOLS: Record<string, POOL_TYPE> = {
  // single farm reward
  '0x7F5Ac0FC127bcf1eAf54E3cd01b00300a0861a62': {
    label: 'STELLA/GLMR',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x8BC3CceeF43392B315dDD92ba30b435F79b66b9e': {
    label: 'USDC.multi/USDT.multi',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x5Ced2f8DD70dc25cbA10ad18c7543Ad9ad5AEeDD': {
    label: 'DAI/USDC.multi',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0xAc2657ba28768FE5F09052f07A9B7ea867A4608f': {
    label: 'USDC.multi/BNB',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x555B74dAFC4Ef3A5A1640041e3244460Dc7610d1': {
    label: 'USDC.multi/GLMR',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x81e11a9374033d11Cc7e7485A7192AE37D0795D6': {
    label: 'STELLA/USDC.multi',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x49a1cC58dCf28D0139dAEa9c18A3ca23108E78B3': {
    label: 'GLMR/ETH.multi',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x367c36dAE9ba198A4FEe295c22bC98cB72f77Fe1': {
    label: 'BUSD/GLMR',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x2AB268c6025F7Cd76A4B6a8A5bc7fE780Fbbfe98': {
    label: 'STELLA/AVAX',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x2F412C140080039eaF9dE01c95e84cFb1c8D98aD': {
    label: 'AVAX/GLMR',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x4CDf77828b839506bF6B6e219017B65623042400': {
    label: 'WBTC.multi/GLMR',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x6775ff3828a19EB5926C0C4D572183cA15Aa4C08': {
    label: 'MATIC/GLMR',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0xF69F219ad163d66e7300731AF3C6b9E5B44954B9': {
    label: 'STELLA/MATIC',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x0Aa48bF937ee8F41f1a52D225EF5A6F6961e39FA': {
    label: 'USDC.multi/ETH.multi',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x2Afab635EA2DC4B498EF1C00E63b7a7dBa9c93C6': {
    label: 'GLMR/FTM',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0x077Fc7B4455050249D7F5511ED588a665E03e6C5': {
    label: 'USDC.multi/FTM',
    farmReward: FARM_REWARD.SINGLE,
  },
  '0xE2BFE2F1437f249B15B7111011219995ecc43155': {
    label: 'LUNC/GLMR',
    farmReward: FARM_REWARD.SINGLE,
  },
  // dual farm reward
  '0xb6835036C9A2A96D3BfB8DBE1722971fEb456a83': {
    label: 'USTC/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x2f6F833fAb26Bf7F81827064f67ea4844BdEa03F': {
    label: 'USDT.ce/BNB',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xEc8aC4CCBBAe310f9e83D102b35178d6C10EDFeA': {
    label: 'USDT.ce/BUSD.ce',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x6f71389426efe6fF4e357Ca6DD012B210A6a3c9c': {
    label: 'BCMC/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x55Db71E6bEaB323290f6571C428C171e15CDBAD2': {
    label: 'APE/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xf4C10263f2A4B1f75b8a5FD5328fb61605321639': {
    label: 'ATOM/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x051FcF8986B30860a1341e0031e5622Bd18d8A85': {
    label: 'ATOM/USDC.multi',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xa3eE3a0a36Dc915fDc93062e4B386DF37d00217E': {
    label: 'ETH.multi/ETH.mad',
    farmReward: FARM_REWARD.DUAL,
    stableContract: '0xb86271571c90ad4E0C9776228437340b42623402',
  },
  '0xAac208af698A620047EBe75C50A4fd8d71192731': {
    label: 'USDT.ce/WBTC.ce',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xa927E1e1E044CA1D9fe1854585003477331fE2Af': {
    label: 'DOT.xc/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x9d19EDBFd29D2e01537624B25806493dA0d73bBE': {
    label: 'ETH.mad/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x9bFcf685e641206115dadc0C9ab17181e1d4975c': {
    label: 'USDC.mad/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xE28459075c806b1bFa72A38E669CCd6Fb4125f6a': {
    label: 'WBTC.mad/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xdA782836B65edC4E6811c7702C5E21786203Ba9d': {
    label: 'USDC.mad/USDT.mad/DAI.mad/FRAX',
    farmReward: FARM_REWARD.DUAL,
    ignoreLpPrice: true,
    stableContract: '0x422b5b7A15FB12c518AA29f9def640b4773427f8',
  },
  '0xA0AA99F71033378864Ed6E499eb03612264e319a': {
    label: 'MAI/Base4Pool(nomad)',
    farmReward: FARM_REWARD.DUAL,
    ignoreLpPrice: true,
    stableContract: '0x7FbE3126C03444D43fC403626ec81E3e809E6b46',
  },
  '0xb536c1F9A157B263B70A9a35705168ACC0271742': {
    label: 'WELL/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x91b11E7649614EaBe97D96d75bE11d1068059FF1': {
    label: 'MAI/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x015c6B2d98969e3bF066110769E53D734e48Ebf6': {
    label: 'FRAX/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xD3DFb90f7996a97f9f394E130342485e37DD28F7': {
    label: 'xcINTR/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xd95cab0Ed89269390f2aD121798e6092Ea395139': {
    label: 'aUSD.xc/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x4C5f99045AF91D2b6d4fa0Ea89FC47cF42711555': {
    label: 'iBTC.xc/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x420aaA13722A191765D86bc55212A54D9f8b5ceb': {
    label: 'ATH/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x48F2D5f75Ce88a1acd262658d06ba8500D171e2c': {
    label: 'CRYSTL/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x00870B0e6994fFb142a91173a882d2F6a9a8Ac4a': {
    label: 'LDO/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x4EfB208eeEb5A8C85af70e8FBC43D6806b422bec': {
    label: 'POOP/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x8CCBbcAF58f5422F6efD4034d8E8a3c9120ADf79': {
    label: 'USDC.wh/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0x8577273FB3B72306F3A59E26ab77116f5D428DAa': {
    label: 'ETH.wh/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xf8f5E8B9Ee84664695B14862212D8092E16331F6': {
    label: 'WBTC.wh/GLMR',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xB326b5189AA42Acaa3C649B120f084Ed8F4dCaA6': {
    label: 'USDC.wh/USDT.wh/BUSD.wh/FRAX',
    farmReward: FARM_REWARD.DUAL,
    ignoreLpPrice: true,
    stableContract: '0xB1BC9f56103175193519Ae1540A0A4572b1566F6',
  },
  '0x61BF1b38930e37850D459f3CB926Cd197F5F88c0': {
    label: 'wstDOT/DOT.xc',
    farmReward: FARM_REWARD.DUAL,
  },
  '0xEceab9F0FcF15Fddbffbd7baE2cEB78CD57b879a': {
    label: 'MAI/Base4Pool(wormhole)',
    farmReward: FARM_REWARD.DUAL,
    ignoreLpPrice: true,
    stableContract: '0xF0A2ae65342f143fc09c83E5f19b706aBB37414D',
  },
  '0xacb7dA459719EA26054D0481c5B3AE5903bd9906': {
    label: 'USDC.axl/Base4Pool(wormhole)',
    farmReward: FARM_REWARD.DUAL,
    ignoreLpPrice: true,
    stableContract: '0xA1ffDc79f998E7fa91bA3A6F098b84c9275B0483',
  },
  '0xe196001e2a4798E437E80493216c2aD1b9f5c190': {
    label: 'athUSD/Base4Pool(wormhole)',
    farmReward: FARM_REWARD.DUAL,
    ignoreLpPrice: true,
    stableContract: '0x715D7721Fa7e8616aE9D274704aF77857779f6F0',
  },
  '0x4FB1b0452341ebB0DF325a8286763447dd6F15fF': {
    label: 'USDC.wh/USDT.wh/FRAX',
    farmReward: FARM_REWARD.DUAL,
    isFeatured: true,
    ignoreLpPrice: true,
    stableContract: '0x5C3dC0Ab1Bd70C5cdc8D0865E023164d4d3Fd8eC',
  },
  '0x6Cd1c3807DbB49785b86cF006Fe2C90287c183B2': {
    label: 'USDC.wh/USDC.axl',
    farmReward: FARM_REWARD.DUAL,
    isFeatured: true,
    ignoreLpPrice: true,
    stableContract: '0x95953409374e1ed252c6D100E7466E346E3dC5b9',
  },
  '0x8BED562B515805CFFBFC3B4105343895B6e01A1A': {
    label: 'MAI/TriPool',
    farmReward: FARM_REWARD.DUAL,
    isFeatured: true,
    ignoreLpPrice: true,
    stableContract: '0x63Ba230fb281A44CB778Ea67a8caE538459c1d0b',
  },
};

export const MOONBEAM_AVERAGE_BLOCK_TIME = 12;

export const SUBGRAPH_ENDPOINTS = {
  STELLA: 'https://api.thegraph.com/subgraphs/name/stellaswap/stella-swap',
  STABLE: 'https://api.thegraph.com/subgraphs/name/stellaswap/stable-amm',
  STABLE2: 'https://api.thegraph.com/subgraphs/name/stellaswap/stable-amm-2',
};

export const SUBGRAPH_QUERIES = {
  STELLA: {
    pairDayData: (
      poolAddresses: string[],
      startTimestamp: EpochTimeStamp,
      endTimestamp: EpochTimeStamp,
    ) => {
      const poolAddressesString = `[${poolAddresses
        .map((poolAddress) => `"${poolAddress}"`)
        .join(',')}]`;
      return `query getPairDayDatas {
        pairDayDatas(first: 1000, orderBy: date, orderDirection: asc, where: { pairAddress_in: ${poolAddressesString}, date_gt: ${startTimestamp}, date_lt: ${endTimestamp} }) {
          id
          pairAddress
          date
          dailyVolumeToken0
          dailyVolumeToken1
          dailyVolumeUSD
          totalSupply
          reserveUSD
        }
      }`;
    },
    getTokenPrice: (tokenAddress: string) => {
      return `query getTokenPrice {
        tokenDayDatas(
          where: {token: "${tokenAddress.toLowerCase()}"}
          orderBy: date
          orderDirection: desc
          first: 1
        ) {
          priceUSD
          token {
            id
            symbol
          }
        }
      }`;
    },
  },
  STABLE: {
    stablesWeeklyVolume: (poolAddresses: string[]) => {
      const poolAddressesString = `[${poolAddresses
        .map((poolAddress) => `"${poolAddress}"`)
        .join(',')}]`;
      return `query getStablesWeeklyVolume {
        swaps (where: { id_in: ${poolAddressesString} }) {
          id
          weeklyVolumes (first: 1) {
            volume
          }
          lpToken
          balances
          tokens{
            id
          }
        }
      }`;
    },
  },
};
