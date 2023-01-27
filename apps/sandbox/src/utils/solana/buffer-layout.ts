import { PublicKey } from '@solana/web3.js';
import { blob, u8 as bigIntU8, u32 as bigIntU32, struct, offset } from 'buffer-layout';

import { BigNumberLayout } from './bignumber';
import { StringLayout } from './string';
import { WrappedLayout } from './wrapped';

export { BigNumberLayout, StringLayout, WrappedLayout };

export const bool = (property: string) =>
  new WrappedLayout(
    bigIntU8(),
    (src: any) => !!src,
    (boolean: any) => Number(boolean),
    property,
  );

export const publicKey = (property?: string) =>
  new WrappedLayout(
    blob(32),
    (b: any) => new PublicKey(b),
    (key: any) => key.toBuffer(),
    property,
  );

export const u8 = (property?: string) => new BigNumberLayout(1, false, property);
export const u16 = (property?: string) => new BigNumberLayout(2, false, property);
export const u24 = (property?: string) => new BigNumberLayout(3, false, property);
export const u32 = (property?: string) => new BigNumberLayout(4, false, property);
export const u64 = (property?: string) => new BigNumberLayout(8, false, property);
export const i64 = (property?: string) => new BigNumberLayout(8, true, property);
export const u128 = (property?: string) => new BigNumberLayout(16, false, property);
export const u256 = (property?: string) => new BigNumberLayout(32, false, property);
export const i128 = (property?: string) => new BigNumberLayout(16, true, property);
export const u3 = (property?: string) => new BigNumberLayout(24, false, property);

export const stringLayout = (span: number, property: string) => new StringLayout(span, property);

export const str = (property: string) =>
  new WrappedLayout(
    vecU8(32),
    (data: any) => data.toString('utf-8'),
    (s: any) => Buffer.from(s, 'utf-8'),
    property,
  );

export const vecU8 = (property: any) => {
  const length = bigIntU32('length');
  const layout = struct([length, blob(offset(length, -length.span), 'data')]);
  return new WrappedLayout(
    layout,
    ({ data }: any) => data,
    (data: any) => ({ data }),
    property,
  );
};
