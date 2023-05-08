import { Address, SupportedChain } from '@defiyield/sandbox';

export type YPool = {
  ypoolToken: Address;
  xyWrappedToken: Address;
  ypoolVault: Address;
  poolIndex: number;
  chainId: number;
};

export type YPoolTokenSymbol = 'USDC' | 'USDT' | 'ETH';

type YPools = {
  USDC: Record<SupportedChain, YPool>;
  USDT: Record<SupportedChain, YPool>;
  ETH: Record<SupportedChain, YPool>;
};

export const YPOOLS: YPools = {
  USDC: {
    ethereum: {
      ypoolToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      xyWrappedToken: '0x2f6Ccc4a900Ee42f822892b8c024aAA08af89701',
      ypoolVault: '0xdD8B0995Cc92c7377c7bce2A097EC70f45A192D5',
      poolIndex: 0,
      chainId: 1,
    },
    binance: {
      ypoolToken: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      xyWrappedToken: '0x2E6B9f6c8F5dc0d750F79Fbd91Dd8412F3458661',
      ypoolVault: '0x2E6B9f6c8F5dc0d750F79Fbd91Dd8412F3458661',
      poolIndex: 1,
      chainId: 56,
    },
    polygon: {
      ypoolToken: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      xyWrappedToken: '0xfE56793f6D7f93fE44B7A290a92b4320A9198f24',
      ypoolVault: '0xf4137e5D07b476e5A30f907C3e31F9FAAB00716b',
      poolIndex: 2,
      chainId: 137,
    },
    cronos: {
      ypoolToken: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
      xyWrappedToken: '0xFDf54F6F232Dd5a6DaF067628Ba045A1B5a6724D',
      ypoolVault: '0x44a54941E572C526a599B0ebe27A14A5BF159333',
      poolIndex: 3,
      chainId: 25,
    },
    fantom: {
      ypoolToken: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
      xyWrappedToken: '0xdD8B0995Cc92c7377c7bce2A097EC70f45A192D5',
      ypoolVault: '0x3A459695D49cD6B9637bC85B7ebbb04c5c3038c0',
      poolIndex: 4,
      chainId: 250,
    },
    kucoin: {
      ypoolToken: '0x980a5AfEf3D17aD98635F6C5aebCBAedEd3c3430',
      xyWrappedToken: '0x3D2d1ce29B8bC997733D318170B68E63150C6586',
      ypoolVault: '0xa274931559Fb054bF60e0C44355D3558bB8bC2E6',
      poolIndex: 5,
      chainId: 321,
    },
    arbitrum: {
      ypoolToken: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      xyWrappedToken: '0x1e4992E1Be86c9d8ed7dcBFcF3665FE568dE98Ab',
      ypoolVault: '0x680ab543ACd0e52035E9d409014dd57861FA1eDf',
      poolIndex: 6,
      chainId: 42161,
    },
    avalanche: {
      ypoolToken: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      xyWrappedToken: '0x19f51343E120151130878D5271b2327ccC19c0Ea',
      ypoolVault: '0x21ae3E63E06D80c69b09d967d88eD9a98c07b4e4',
      poolIndex: 7,
      chainId: 43114,
    },
    optimism: {
      ypoolToken: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      xyWrappedToken: '0xa274931559Fb054bF60e0C44355D3558bB8bC2E6',
      ypoolVault: '0x1e4992E1Be86c9d8ed7dcBFcF3665FE568dE98Ab',
      poolIndex: 8,
      chainId: 10,
    },
    moonriver: {
      ypoolToken: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
      xyWrappedToken: '0x1e4992E1Be86c9d8ed7dcBFcF3665FE568dE98Ab',
      ypoolVault: '0x680ab543ACd0e52035E9d409014dd57861FA1eDf',
      poolIndex: 9,
      chainId: 1285,
    },
    klaytn: {
      ypoolToken: '0x754288077D0fF82AF7a5317C7CB8c444D421d103',
      xyWrappedToken: '0xD236639F5B00BC6711aC799bac5AceaF788b2Aa3',
      ypoolVault: '0xB238d4339a44f93aBCF4071A9bB0f55D2403Fd84',
      poolIndex: 10,
      chainId: 1285,
    },
    // thunderCore
    // astar
    // wemix
  },
  USDT: {
    ethereum: {
      ypoolToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      xyWrappedToken: '0x3243278E0F93cD6F88FC918E0714baF7169AFaB8',
      ypoolVault: '0x8e921191a9dc6832C1c360C7c7B019eFB7c29B2d',
      poolIndex: 0,
      chainId: 1,
    },
    binance: {
      ypoolToken: '0x55d398326f99059fF775485246999027B3197955',
      xyWrappedToken: '0x8e921191a9dc6832C1c360C7c7B019eFB7c29B2d',
      ypoolVault: '0xD195070107d853e55Dad9A2e6e7E970c400E67b8',
      poolIndex: 1,
      chainId: 56,
    },
    polygon: {
      ypoolToken: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      xyWrappedToken: '0xE7508dC910bcA06108a9bc6853eCe57DDD98d975',
      ypoolVault: '0x3243278E0F93cD6F88FC918E0714baF7169AFaB8',
      poolIndex: 2,
      chainId: 137,
    },
    cronos: {
      ypoolToken: '0x66e428c3f67a68878562e79A0234c1F83c208770',
      xyWrappedToken: '0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1',
      ypoolVault: '0x74A0EEA77e342323aA463098e959612d3Fe6E686',
      poolIndex: 3,
      chainId: 25,
    },
    fantom: {
      ypoolToken: '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
      xyWrappedToken: '0xD9Ce145225ad2AE62739e44a68E167845485631f',
      ypoolVault: '0xC255563d3Bc3Ed7dBbb8EaE076690497bfBf7Ef8',
      poolIndex: 4,
      chainId: 250,
    },
    kucoin: {
      ypoolToken: '0x0039f574eE5cC39bdD162E9A88e3EB1f111bAF48',
      xyWrappedToken: '0x3689D3B912d4D73FfcAad3a80861e7caF2d4F049',
      ypoolVault: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      poolIndex: 5,
      chainId: 321,
    },
    arbitrum: {
      ypoolToken: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      xyWrappedToken: '0xA5Cb30E5d30A9843B6481fFd8D8D35DDED3a3251',
      ypoolVault: '0x7a483730AD5a845ED2962c49DE38Be1661D47341',
      poolIndex: 6,
      chainId: 42161,
    },
    avalanche: {
      ypoolToken: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      xyWrappedToken: '0x7DE7B07c9FF24A35C70FeA573d429d6223c3F8b0',
      ypoolVault: '0x3D2d1ce29B8bC997733D318170B68E63150C6586',
      poolIndex: 7,
      chainId: 43114,
    },
    optimism: {
      ypoolToken: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      xyWrappedToken: '0x3689D3B912d4D73FfcAad3a80861e7caF2d4F049',
      ypoolVault: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      poolIndex: 8,
      chainId: 10,
    },
    moonriver: {
      ypoolToken: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
      xyWrappedToken: '0x3689D3B912d4D73FfcAad3a80861e7caF2d4F049',
      ypoolVault: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      poolIndex: 9,
      chainId: 1285,
    },
    klaytn: {
      ypoolToken: '0xceE8FAF64bB97a73bb51E115Aa89C17FfA8dD167',
      xyWrappedToken: '0x3689D3B912d4D73FfcAad3a80861e7caF2d4F049',
      ypoolVault: '0xF526EFc174b512e66243Cb52524C1BE720144e8d',
      poolIndex: 10,
      chainId: 1285,
    },
    // thunderCore
    // astar
    // wemix
  },
  ETH: {
    ethereum: {
      ypoolToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      xyWrappedToken: '0x60c779b8348c0a0517F8e2B0489a88CeaF87822F',
      ypoolVault: '0x57eA46759fed1B47C200a9859e576239A941df76',
      poolIndex: 0,
      chainId: 1,
    },
    binance: {
      ypoolToken: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      xyWrappedToken: '0x57eA46759fed1B47C200a9859e576239A941df76',
      ypoolVault: '0xa0ffc7eDB9DAa9C0831Cdf35b658e767ace33939',
      poolIndex: 1,
      chainId: 56,
    },
    polygon: {
      ypoolToken: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      xyWrappedToken: '0xFbe19956395baE1065206255bC333E493702f221',
      ypoolVault: '0x29d91854B1eE21604119ddc02e4e3690b9100017',
      poolIndex: 2,
      chainId: 137,
    },
    fantom: {
      ypoolToken: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
      xyWrappedToken: '0x7AeB6c52392A53Ecedf4aE99B363Ca8B71341ad7',
      ypoolVault: '0x5146ba1f786D41ba1E876b5Fd3aA56bD516Ed273',
      poolIndex: 3,
      chainId: 250,
    },
    cronos: {
      ypoolToken: '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a',
      xyWrappedToken: '0xEf367cdB37Ce3F43130fB9651d3db8fBF6045c87',
      ypoolVault: '0x8266B0c8eF1d70cC4b04F8E8F7508256c0E1200f',
      poolIndex: 4,
      chainId: 250,
    },
    arbitrum: {
      ypoolToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      xyWrappedToken: '0xeAe1BB0B635F6615e0B61c1Cd93d30f0CF93A96E',
      ypoolVault: '0xd1ae4594E47C153ae98F09E0C9267FB74447FEa3',
      poolIndex: 5,
      chainId: 42161,
    },
    avalanche: {
      ypoolToken: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
      xyWrappedToken: '0xde6146A0B751c31eA73A4E51300b6c8A8BF6D798',
      ypoolVault: '0xEFaaf68a9a8b7D93bb15D29c8B77FCe87Fcc91b8',
      poolIndex: 6,
      chainId: 43114,
    },
    optimism: {
      ypoolToken: '0x4200000000000000000000000000000000000006',
      xyWrappedToken: '0xE2E785E3fcB00F3d2f5E01291E7741635c54F140',
      ypoolVault: '0x91474Fe836BBBe63EF72De2846244928860Bce1B',
      poolIndex: 7,
      chainId: 10,
    },
  },
};

export type veXYConfig = {
  xy: Address;
  veXY: Address;
};

type veXYConfigs = {
  readonly [chainId in SupportedChain]?: veXYConfig;
};

export const VEXYS: veXYConfigs = {
  ethereum: {
    xy: '0x77777777772cf0455fB38eE0e75f38034dFa50DE',
    veXY: '0x6A816cEE105a9409D8df0A83d8eeaeD9EB4309fE',
  },
  binance: {
    xy: '0x666666661f9B6D8c581602AAa2f76cbead06C401',
    veXY: '0x30e6c8B82833C32090E9159229385B092E3889a3',
  },
  polygon: {
    xy: '0x55555555A687343C6Ce28C8E1F6641dc71659fAd',
    veXY: '0x5f57a73BBbb32ae85681EB44cF12D99FeeFBB9ae',
  },
  fantom: {
    xy: '0x444444443B0fcB2733b93F23C910580FBa52FFFA',
    veXY: '0x35D0a7b1336D4edf9364Ef8Bf5c1aba0E151b777',
  },
};
