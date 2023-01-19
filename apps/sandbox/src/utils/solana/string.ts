import { Blob } from 'buffer-layout';

export class StringLayout extends Blob {
  constructor(length: number, property: string) {
    super(length, property);
  }

  decode(b: Buffer, offset?: number) {
    const raw = super.decode(b, offset).toString();
    const length = raw.indexOf('\u0000');
    if (length === -1) {
      return raw;
    }
    return raw.slice(0, length);
  }

  encode(src: any, b: Buffer, offset?: number) {
    if (undefined === offset) {
      offset = 0;
    }
    if (typeof src !== 'string') {
      src = src.toString();
    }
    let tmp = src;
    while (tmp.length < this.span) {
      tmp += '\u0000';
    }
    const srcb = Buffer.from(tmp, 'utf8');
    srcb.copy(b, offset);
    return this.span;
  }
}
