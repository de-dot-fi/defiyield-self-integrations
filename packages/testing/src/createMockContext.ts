import type { ChainProvider, Context, ProviderMap } from '@defiyield/sandbox';
import { ethers as libEthers } from '../../../apps/sandbox/src/providers';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { createMock } from './createMock';
import type { MockContracts } from './interfaces/MockContract';
import MockAdapter from 'axios-mock-adapter';
import * as BufferLayout from 'buffer-layout';
import * as solanaWeb3 from '@solana/web3.js';

export function createMockProvider(contracts: MockContracts): ChainProvider {
  const ethers = createMock({
    utils: {
      parseEther: (str: string) => libEthers.utils.parseEther(str),
      parseUnits: (str: string, dec: number) => libEthers.utils.parseUnits(str),
      formatEther: (bn: libEthers.BigNumber) => libEthers.utils.formatEther(bn),
      formatUnits: (bn: libEthers.BigNumber, dec: number) => libEthers.utils.formatUnits(bn, dec),
    },
    BigNumber: {
      from: (str: string) => libEthers.BigNumber.from(str),
    },
    Contract: (address: string) => contracts[address] || contracts['fallback'],
  });

  return {
    cardano: {
      getStakeAddress: () => '',
    },
    solana: {
      BufferLayout: BufferLayout,
      web3: solanaWeb3,
    },
    chain: null as any,
    endpoint: null as any,
    ethers: ethers as Context['ethers'],
    ethcall: ethers as Context['ethcall'],
    provider: createMock() as Context['provider'],
    ethcallProvider: createMock({
      all: (args: unknown[]) => args,
      tryAll: (args: unknown[]) => args,
      tryEach: (args: unknown[]) => args,
      getEthBalance: (args: unknown[]) => args,
    }) as Context['ethcallProvider'],
  };
}

export function createMockProviderMap(contracts: MockContracts): ProviderMap {
  const mockProvider = createMockProvider(contracts);

  const providerTrap = {
    get() {
      return () => mockProvider;
    },
  };

  return new Proxy({}, providerTrap) as ProviderMap;
}

export function createMockContextForProvider(chain: ChainProvider): Context {
  return {
    solana: chain.solana,
    chain: chain.chain,
    endpoint: chain.endpoint,
    cardano: chain.cardano,
    ethcall: chain.ethcall,
    ethcallProvider: chain.ethcallProvider,
    ethers: chain.ethers,
    provider: chain.provider,
    logger: createMock(),
    BigNumber: BigNumber,
    axios: axios,
  };
}

export function createMockContext(contracts: MockContracts): [Context, MockAdapter] {
  const provider = createMockProvider(contracts);
  const mockAxiosAdapter = new MockAdapter(axios);
  return [
    createMockContextForProvider(provider),
    mockAxiosAdapter, // https://github.com/ctimmerm/axios-mock-adapter
  ];
}
