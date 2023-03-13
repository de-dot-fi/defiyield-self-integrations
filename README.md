<h1 align="center">
    <a href="https://defiyield.app/"><b>DeFiYield Self Integrations</b></a>
</h1>
<p align="center">
    <a href="https://twitter.com/defiyield_app"><b>Twitter</b></a>
</p>

```bash
# Quickstart
yarn install
yarn workshop make MyNewIntegrationProject
yarn workshop start MyNewIntegrationProject
# Open your browser to http://localhost:8070
# And open your editor of choice to get started!
```

##### Table of Contents

- [Setup](#setup)
  - [Requirements](#requirements)
  - [Environment Variables](#environment-variables)
- [Create A New Integration](#create-a-new-integration)
  - [Context Interface](#context-interface)
  - [Creating A Module](#creating-a-module)
- [Supported Chains](#supported-chains)
- [Supported Project Categories](#supported-project-categories)
- [Contributing](#contributing)
- [Testing](#testing)
  - [Create Test Project](#create-test-project)
  - [Create Mock Context](#create-mock-context)
  - [Mocking Contracts](#mocking-contracts)
  - [Mocking HTTP Calls](#mocking-http-calls)
- [FAQ](#faq)
  - [Incorrect or Missing Token Details](#incorrect-or-missing-token-details)

## Headers

# Setup

## Requirements

- Node 16.16
- Yarn 3.2.3

## Environment Variables

`.env` is optional and sane defaults have been set, but to override a value such as setting your preferred RPC endpoint, or port, simply copy the provided `.env.example` to `.env` and adjust as needed

# Create A New Integration

1. Generate the boilerplate code

Run the following command to generate a basic skeleton for your project.

```bash
yarn workshop make AuraFinance
```

This will create several files in `/apps/workshop/projects/AuraFinance`

- _index.ts_
  - This is the main entry to your project. The default export contains several _fields that are used throughout the site._
    - `name` is what will be displayed wherever the project name is listed
    - `categories` are used internally several areas to help ensure the project is displayed in all the right places
    - `links` is for external links such as github, twitter
- _modules/_
  - This is where the bulk of your code will go. Create a file for each 'feature' or logical group of your protocol. For example if doing a protocol with a MasterChef, and Single Staking, This could be accomplished by trying to gather all available pools in a single module, however a much simpler route would be to just separate them into two different modules. 'MasterChef' and 'SingleStake'. This allows you to handle the nuanced differences of how the contracts work in isolation
- _abis/_
  - ABI json files specific to your project can go here.
  - Common ones such as ERC20, or the UniV2 ABI can be found in `/packages/abis`
- _icons/_
  - Static assets for Protocol icons, token icons, etc _(Coming Soon)_
- _tests/project.spec.ts_
  - This is an example test file, but modify as needed! create more tests if it makes sense for your project

Your `index.ts` will be the main entry point, and its `default export` will be the configuration for your project.

```ts
export default {
  name: "Aura Finance", // name of the project
  categories: ["Governance", "Yield"], // project categories (see: TODO: for the full list of available options)
  links: {
    // used throughout the DefiYield.app website, only Logo and URL are required, the rest are optional
    logo: "https://icons.llama.fi/aura.png",
    url: "https://aura.finance/",
    discord: "https://discord.gg/aurafinance",
    twitter: "https://twitter.com/aurafinance",
    telegram: "",
    github: "https://github.com/aurafinance",
  },

  // 'modules' can be divided up into seperate files to make development easier
  // Each module can have its own token list, pool list, and user balance checker
  modules: [StakeBalancerTokens, LockAura, LockAuraClaimable, ClaimableRewards],
};
```

Each Module has several responsibilities

1. Fetch all of the tokens used by this module. This is accomplished by fulfilling the `preloadTokens()` method and returning all of the addresses. The full token details including name, price, etc will be fetched automatically\*
2. Fetch all of the available Pools. a 'Pool' is a single item that a user can deposit into. This could be a single pool on a MasterChef contract, a single market for a lending protocol, or a single Liquidity Pool for a dex. This is done by filling the `fetchPools()` method. This is also where `APR` will be calculated and saved to the pool if possible.
3. Fetch user balances. This fetches the deposit amounts, and available reward amounts for each pool. This is the `fetchUserPositions()` method.

## Context Interface

The following context object is common to all available methods & passed as the argument into each module method.

```ts
// main Context object passed into
interface Context {
  // Plain Axios Instance => https://github.com/axios/axios
  axios: axios;
  // BigNumber.js => https://github.com/MikeMcl/bignumber.js
  BigNumber: BigNumber;
  // logger, please no console.log :)
  logger: {
    debug: (msg: string) => void;
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
  // ethers => https://github.com/ethers-io/ethers.js/
  ethers: ethers;
  // ethers provider instantiated to your current working chain
  // * please use ethcall where possible though!
  provider: ethers.provider;
  // ethcall => https://github.com/Destiner/ethcall
  ethcall: ethcall;
  // ethcall provider instantiated to your current working chain
  ethcallProvider: ethcall.Provider;
}
```

In addition, several methods receive additional context to make development easier

```ts
interface FetchPoolsContext extends Context {
  tokens: Token[];
}

interface FetchUserPositionsContext extends Context {
  pools: Pool[];
}

interface FetchTokenDetailsContext extends Context {
  address: string;
}

interface FetchTokenPricesContext extends Context {
  // See Below
  assets: ComplexAsset[];
}

interface ComplexAsset {
  address: string;
  decimals: number;
  categories: { code: string }[];
  underlying: { address: string; decimals: number; price: number }[];
  metadata: { [key: string]: unknown };
}
```

## Creating A Module

In general, the simplest module must do 3 things.

1. Return the addresses of all tokens used by the module
1. Return all available pools in the module
1. Return user balances for a supplied user address

```ts
export interface ModuleDefinitionInterface {
  name: string;

  chain: SupportedChain;

  type: SupportedProtocolType;

  /**
   * Return an array of tokens involved in this module. These will be the only tokens available
   * when getting the pool data, so make sure to include all deposited tokens (LP's etc),
   * Tokenized position or Vault tokens, and any reward tokens you need. Underlying tokens will
   * be resolved and included automatically (i.e. if you add an LP token, you shouldn't need to
   * add both underlying tokens also)
   */
  preloadTokens: (context: Context) => Promise<string[]>;

  /**
   * This will return a list of all available pools for the module
   */
  fetchPools: (context: FetchPoolsContext) => Promise<(Pool | void)[]>;

  /**
   *  This will check User balances for all pools in this module
   */
  fetchUserPositions: (
    context: FetchUserPositionsContext
  ) => Promise<(UserPosition | void)[]>;
}
```

# Supported Chains

- **Arbitrum**: `arbitrum`
- **Aurora**: `aurora`
- **Avalanche**: `avalanche`
- **Binance**: `binance`
- **Boba**: `boba`
- **Celo**: `celo`
- **Cronos**: `cronos`
- **Ethereum**: `ethereum`
- **Fantom**: `fantom`
- **Fuse**: `fuse`
- **Gnosis**: `gnosis`
- **Harmony**: `harmony`
- **Heco**: `heco`
- **Iotex**: `iotex`
- **Kava**: `kava`
- **Klaytn**: `klaytn`
- **Kucoin**: `kucoin`
- **Metis**: `metis`
- **Milkomedia**: `milkomedia`
- **Moonbeam**: `moonbeam`
- **Moonriver**: `moonriver`
- **Okx**: `okx`
- **Optimism**: `optimism`
- **Polygon**: `polygon`
- **Solana**: `solana`
- **Cosmos**: `cosmos`
- **Juno**: `juno`
- **Kava**: `kava`
- **Osmosis**: `osmosis`
- **Secret**: `secret`
- **Thor**: `thor`
- **Sifchain**: `sifchain`
- **Stargaze**: `stargaze`
- **Akash**: `akash`
- **Kujira**: `kujira`
- **Evmos**: `evmos`
- **Crescent**: `crescent`
- **Agoric**: `agoric`
- **Terra2**: `terra-2`

# Supported Project Categories

Below are the currently supported categories. If your project doesn't fit into one or several of these, please open an issue with an explanation & description of your proposed category.

- **DEX**: `DEX`
- **Yield**: `Yield`
- **Lending**: `Lending`
- **CDP**: `CDP`
- **Yield Aggregator**: `Yield Aggregator`
- **Cross Chain**: `Cross Chain`
- **Liquid Staking**: `Liquid Staking`
- **dPOS Staking**: `dPOS Staking`
- **Derivatives**: `Derivatives`
- **Algo-stable**: `Algo-stable`
- **Insurance**: `Insurance`
- **Synthetics**: `Synthetics`
- **Gaming**: `Gaming`
- **Governance**: `Governance`
- **NFT Marketplace**: `NFT Marketplace`
- **NFT Lending**: `NFT Lending`
- **Other**: `Other`

# Contributing

Read our [Contribution Guide](./CONTRIBUTING.md)

# Testing

Modules for projects can easily be tested in isolation, along with mock requests for fast and repeatable testing. Testing the 'Project' instead of the standalone module can be easier as it handles passing in the correct context to each method automatically. If you wish to test your module as a stand alone, this can also be done, but then you need to create the appropriate Context to supply. see [Create Mock Context](#create-mock-context) for more info on this.

## Create Test Project

A Testing instance of your entire project can be created using the `createTestProject` helper. This can initialize a single module for testing, as well as preparing mocks for `ethers` & `axios`. The project can easily be attached to the testing context. Results will be returned as an array of arrays, with the index matching the index of the module. For testing, you will likely only be testing a single module, so your desired response will always be `[0]` of the results.

```ts
interface Project {
  /**
   * Preload all tokens for all available modules
   */
  preloadTokens(): Promise<Token[][]>;

  /**
   * Fetch all pools for all modules
   */
  fetchPools(): Promise<Pool[][]>;

  /**
   * Fetches all user positions for all modules
   */
  fetchUserPositions(user: string): Promise<UserPosition[][]>;
}
```

```ts
describe("#project #lending #0Vix", () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: "0Vix",
      path: join(__dirname, "index.ts"),
      modules: [Lending0Vix], // only initialize the module(s) you wish to test
      contracts: mockContracts, // mock contracts, see below for more details
    });
  });

  test("Fetches All tokens", async ({ project }) => {
    // destructure here to easily grab the first module results
    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(2);
  });
});
```

## Create Mock Context

Sometimes you may want to create the mock context manually to directly call your module functions. This can be accomplished using the `createMockContext` helper.

```ts
describe("#project #lending #0Vix", () => {
  test("Token Addresses are resolved and found", async () => {
    const [mockContext] = createMockContext(mockContracts); // see Mock Contracts below

    const tokens = await Lending0Vix.preloadTokens(mockContext);

    expect(tokens).toEqual(mockMarketAddresses);
    expect(tokens.length).toEqual(mockMarketAddresses.length);
    expect(mockContext.ethcall.Contract).toBeCalledTimes(1);
    expect(mockContext.ethcallProvider.all).toBeCalledTimes(1);
  });
});
```

## Mocking Contracts

Contract responses can easily be mocked using either `createMockContext` or `createTestProject` as shown above. To create the mock, simple create an object keyed by the address to be called, with the value being the methods & responses to be used. All logic will flow normally, so you can see in the example below, the real `0x8849` address is called initially, as that address could be hardcoded into the module, however fake addresses are returned for the markets. Those same addresses are used in subsequent calls within the module, so we will need to mock their responses also. A special key address `fallback` will be used for all unknown/un-mocked addresses

```ts
const mockContracts: MockContracts = {
  "0x8849f1a0cB6b5D6076aB150546EddEe193754F1C": {
    getAllMarkets: () => ["0xdeadbeef", "0xcafebabe"],
    markets: (market: string) => {
      const responses = {
        "0xdeadbeef": { collateralFactorMantissa: 960000000000000000 },
        "0xcafebabe": { collateralFactorMantissa: 630000000000000000 },
      }

      return responses[market]
  },
  fallback: {
    supplyRatePerTimestamp: () => "31500000000",
    borrowRatePerTimestamp: () => "12500000000",
  },
};

describe("#project #lending #0Vix", () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: "0Vix",
      path: join(__dirname, "index.ts"),
      modules: [Lending0Vix],
      contracts: mockContracts,
    });
  });

  test("Fetches All Pools", async ({ project }) => {
    const [pools] = await project.fetchPools();

    expect(pools.length).toEqual(2);
  });
});
```

## Mocking HTTP Calls

An instance of [axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter) is also returned from the `createMockContext` helper, making mocking any axios calls simple

```ts
describe("Utils", () => {
  test("fetches pool list from a third party API", async () => {
    const [mockContext, mockAxios] = createMockContext(mockContracts);

    mockAxios.onGet("https://api.beefy.finance/vaults").reply(200, [
      {
        id: "hermes-m.dai-m.usdc",
        tokenAddress: "0x5E985F09c6700FAebAaD4AedC07FA6e218A7ca04",
        earnedTokenAddress: "0x587895668a5db7B3b43F51b9F92460D5BbFD8D89",
        status: "active",
        network: "metis",
        strategy: "0xA15a91C3FB5304d53f9984d045d1B0e631f1E65C",
      },
      {
        id: "hermes-m.usdt-m.usdc",
        tokenAddress: "0xc7C7509D1A192F00C806A0793e5946aae7266D6a",
        earnedTokenAddress: "0xa9Fd735728d65a3D786bE9fEFeCF400d23F46907",
        status: "active",
        network: "metis",
        strategy: "0xcFd89b21405a4BbF9c5b380954BB4F3f55Bb72e5",
      },
    ]);

    const pools = await getPoolList(mockContext);

    expect(pools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          tokenAddress: expect.any(String),
          earnedTokenAddress: expect.any(String),
          status: expect.any(String),
          network: expect.any(String),
          strategy: expect.any(String),
        }),
      ])
    );
  });
});
```

# FAQ

## Incorrect or Missing Token Details

### Missing Tokens

If the token you are using appears to be missing and not available for use, try waiting a few minutes as our system will attempt to automatically resolve any details. Usually this shouldn't take more than a minute or two, but in some cases could take much longer. If its still unavailable, please [open an issue](https://github.com/defiyield-app/defiyield-self-integrations/issues/new?assignees=&labels=i%3A+bug%2C+i%3A+needs+triage&template=token-bugs.md&title=Missing%20Token:)

### Incorrect Token

If a token has incorrect information such as wrong decimals, wrong price, wrong underlying tokens, etc, The simplest solution here is to [open an issue](https://github.com/defiyield-app/defiyield-self-integrations/issues/new?assignees=&labels=i%3A+bug%2C+i%3A+needs+triage&template=token-bugs.md&title=Incorrect%20Token:)
