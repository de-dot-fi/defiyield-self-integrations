import { SFSupportedChain } from './types';

export const API_ENDPOINT = 'https://api.singlefinance.io/api';

export const SINGLE_TOKEN: Record<SFSupportedChain, string> = {
  cronos: '0x0804702a4E749d39A35FDe73d1DF0B1f1D6b8347'.toLowerCase(),
  fantom: '0x8cc97b50fe87f31770bcdcd6bc8603bc1558380b'.toLowerCase(),
  arbitrum: '0x55853edc67aa68ec2e3903ac00f2bc5bf2ca8db0'.toLowerCase(),
};

export const BIG_BANG: Record<SFSupportedChain, string> = {
  cronos: '0x1Ae8a7C582C3f9F9117d5Bc2863F2eD16cBd29cb'.toLowerCase(),
  fantom: '0x7C770a787B430582AbccE88886e9E4E24A457A61'.toLowerCase(),
  arbitrum: '0x490Eba9a1F0d4A2311B6c158eFAbdd259Af5030a'.toLowerCase(),
};

export const AVAILABLE_POOLS: Record<SFSupportedChain, string[]> = {
  cronos: ['CRO', 'USDC', 'VVS', 'MMF', 'USDT', 'VERSA', 'ARGO', 'bCRO', 'VNO'],
  fantom: ['FTM', 'USDC', 'fUSDT'],
  arbitrum: ['WETH', 'USDC', 'USDT', 'MAGIC', 'DPX', 'RDPX'],
};

export const mapToChainId: Record<SFSupportedChain, number> = {
  cronos: 25,
  fantom: 250,
  arbitrum: 42161,
};

const blocksPerYear = (secondsPerBlock: number) => (60 / secondsPerBlock) * 60 * 24 * 365;

export const BLOCKS_PER_YEAR: Record<SFSupportedChain, number> = {
  cronos: blocksPerYear(5.8),
  fantom: blocksPerYear(1.2),
  arbitrum: blocksPerYear(0.25),
};
