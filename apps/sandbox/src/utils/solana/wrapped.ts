import { Layout } from 'buffer-layout';

export class WrappedLayout extends Layout {
  protected layout: any;
  protected decoder: any;
  protected encoder: any;

  constructor(layout: any, decoder: any, encoder: any, property: any) {
    super(layout.span, property);
    this.layout = layout;
    this.decoder = decoder;
    this.encoder = encoder;
  }

  decode(b: Uint8Array, offset: number): any {
    return this.decoder(this.layout.decode(b, offset));
  }

  encode(src: any, b: Uint8Array, offset: number): number {
    return this.layout.encode(this.encoder(src), b, offset);
  }

  getSpan(b: Uint8Array, offset: number) {
    return this.layout.getSpan(b, offset);
  }
}
