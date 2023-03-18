import BN from 'bn.js';
import { Blob, blob, Layout } from 'buffer-layout';

export class BigNumberLayout extends Layout {
  private readonly BIT_WIDTH = 8;
  protected blob: Blob;
  protected signed: boolean;

  constructor(span: number, signed: boolean, property: any) {
    super(span, property);
    this.blob = blob(span);
    this.signed = signed;
  }

  decode(b: Uint8Array, offset = 0) {
    // @ts-expect-error missing proper types
    const num = new BN(this.blob.decode(b, offset), 10, 'le');
    if (this.signed) {
      return num.fromTwos(this.span * this.BIT_WIDTH).clone();
    }
    return num;
  }

  encode(src: any, b: Uint8Array, offset = 0) {
    if (this.signed) {
      src = src.toTwos(this.span * this.BIT_WIDTH);
    }
    // @ts-expect-error missing proper types
    return this.blob.encode(src.toArrayLike(Buffer, 'le', this.span), b, offset);
  }
}
