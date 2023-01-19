/* eslint-disable max-classes-per-file */
declare module 'buffer-layout' {
  export function greedy(elementspan: number, property: string): GreedyCount;
  export function offset(layout: Layout, offset: number, property?: string): OffsetLayout;
  export function u8(property?: string): UInt;
  export function u16(property?: string): UInt;
  export function u24(property?: string): UInt;
  export function u32(property?: string): UInt;
  export function u40(property?: string): UInt;
  export function u48(property?: string): UInt;
  export function nu64(property?: string): NearUInt64;
  export function u16be(property?: string): UIntBE;
  export function u24be(property?: string): UIntBE;
  export function u32be(property?: string): UIntBE;
  export function u40be(property?: string): UIntBE;
  export function u48be(property?: string): UIntBE;
  export function nu64be(property?: string): NearUInt64BE;
  export function s8(property?: string): Int;
  export function s16(property?: string): Int;
  export function s24(property?: string): Int;
  export function s32(property?: string): Int;
  export function s40(property?: string): Int;
  export function s48(property?: string): Int;
  export function ns64(property?: string): NearInt64;
  export function s16be(property?: string): IntBE;
  export function s24be(property?: string): IntBE;
  export function s32be(property?: string): IntBE;
  export function s40be(property?: string): IntBE;
  export function s48be(property?: string): IntBE;
  export function ns64be(property?: string): NearInt64BE;
  export function f32(property?: string): Float;
  export function f32be(property?: string): FloatBE;
  export function f64(property?: string): Double;
  export function f64be(property?: string): DoubleBE;
  export function struct(fields: any, property?: string, decodePrefixes?: any): Structure;
  export function bits(word: any, msb: Buffer, property: string): BitStructure;
  export function seq(elementlayout: Layout, count: number, property?: string): Sequence;
  export function union(discr: any, defaultlayout: Layout, property?: string): Union;
  export function unionLayoutDiscriminator(
    layout: Layout,
    property: string,
  ): UnionLayoutDiscriminator;
  export function blob(length: any, property?: string): Blob;
  export function cstr(property?: string): CString;
  export function utf8(maxspan: number, property?: string): UTF8;

  export abstract class Layout {
    constructor(span: number, property: string);
    span: number;
    property: string;
    makeDestinationObject(): Record<string, any>;
    abstract decode(b: Buffer, offset: number): number | any[] | any;
    abstract encode(src: number | any[] | any, b: Buffer, offset?: number): number;
    getSpan(b: Buffer, offset?: number): number;
    replicate(property: string): Layout;
    fromArray(values: any[]): any | undefined;
  }
  export function nameWithProperty(name: string, lo: BitField): any;

  export function bindConstructorLayout(Class: Layout, layout: Layout): void;

  export abstract class ExternalLayout extends Layout {
    abstract isCount(): boolean;
  }

  export class GreedyCount extends ExternalLayout {
    elementspan: number;
    isCount(): boolean;
    decode(b: Buffer, offset?: number): number;
    encode(src: number | any[] | any, b?: Buffer, offset?: number): number;
  }

  export class OffsetLayout extends Layout {
    constructor(layout: Layout, offset: number, property: string);

    layout: Layout;

    offset: number;
    isCount(): boolean;
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class UInt extends Layout {
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): any;
  }

  export class UIntBE extends Layout {
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): any;
  }

  export class Int extends Layout {
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): any;
  }

  export class IntBE extends Layout {
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): any;
  }

  export class Float extends Layout {
    constructor(property: string);
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class FloatBE extends Layout {
    constructor(property: string);
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class Double extends Layout {
    constructor(property: string);
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class DoubleBE extends Layout {
    constructor(property: string);
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class Sequence extends Layout {
    constructor(elementLayout: Layout, count: number, property: string);
    elementLayout: Layout;
    count: number;
    getSpan(b: Buffer, offset: number): any;
    decode(b: Buffer, offset?: number): any[];
    encode(src: number | any[] | any, b: Buffer, offset: number): any;
  }

  export class Structure extends Layout {
    constructor(fields: Layout[], property: string, decodePrefixes: boolean);
    fields: Layout[];
    decodePrefixes: boolean;
    getSpan(b: Buffer, offset: number): any;
    decode(b: Buffer, offset?: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
    fromArray(values: any): Record<string, any>;
    layoutFor(property: string): Layout;
    offsetOf(property: string): number;
  }

  export abstract class UnionDiscriminator {
    constructor(property: string);
    property: string;
    abstract decode(b: Buffer, offset: number): void;
    abstract encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class UnionLayoutDiscriminator extends UnionDiscriminator {
    constructor(layout: Layout, property: string);
    layout: ExternalLayout;
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class Union extends Layout {
    constructor(
      discr: UnionDiscriminator | ExternalLayout | Layout,
      defaultlayout: Layout,
      property: string,
    );
    discriminator: any;
    usesPrefixDiscriminator: boolean;
    defaultlayout: Layout;
    registry: Record<string, any>;
    getSourceVariant: (src: number | any[] | any) => undefined | VariantLayout;
    configGetSourceVariant: (gsv: () => void) => void;
    getSpan(b: Buffer, offset: number): any;
    defaultGetSourceVariant(src: number | any[] | any): undefined | VariantLayout;
    decode(b: Buffer, offset: number): any;

    encode(src: number | any[] | any, b: Buffer, offset: number): any;

    addVariant(variant: number, layout: Layout, property: string): VariantLayout;

    getVariant(
      vb: number | Buffer,
      offset: number,
    ):
      | {
          VariantLayout: number;
        }
      | undefined;
  }
  export class VariantLayout extends Layout {
    constructor(union: Union, variant: number, layout: Layout, property: string);
    union: Union;

    variant: number;

    layout: Layout;
    getSpan(b: Buffer, offset: number): any;
    decode(b: Buffer, offset: number): Record<string, any>;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;

    fromArray(values: any): any;
  }

  export class BitStructure extends Layout {
    constructor(word: Layout, msb: Buffer, property: string);
    word: UInt | UIntBE;
    msb: boolean;
    fields: any[];
    _packedSetValue: (v: any) => BitStructure;
    _packedGetValue: () => number;
    decode(b: Buffer, offset: number): Record<string, any>;
    encode(src: number | any[] | any, b: Buffer, offset: number): any;

    addField(bits: number, property: string): BitField;

    addBoolean(property: string): boolean;

    fieldFor(property: string): BitField;
  }

  export class BitField {
    constructor(container: BitStructure, bits: number, property: string);

    container: BitStructure;
    bits: number;
    valueMask: number;
    start: number;
    wordMask: number;
    property: string;
    decode(b: Buffer, offset: number): number | boolean;
    encode(value: any): void;
  }

  export class Boolean extends BitField {
    constructor(container: BitStructure, property: string);

    decode(b: Buffer, offset: number): number | boolean;
    encode(value: any): any;
  }

  export class Blob extends Layout {
    length: any;
    getSpan(b: Buffer, offset: number): any;
    decode(b: Buffer, offset?: number): any;

    encode(src: number | any[] | any, b: Buffer, offset: number): any;
  }

  export class CString extends Layout {
    constructor(property: string);
    getSpan(b: Buffer, offset: number): number;
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class UTF8 extends Layout {
    maxspan: number;
    getSpan(b: Buffer, offset: number): number;
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class Constant extends Layout {
    value: Record<string, any> | number | string;
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class NearUInt64 extends Layout {
    constructor(property: string);
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class NearUInt64BE extends Layout {
    constructor(property: string);
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class NearInt64 extends Layout {
    constructor(property: string);
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }

  export class NearInt64BE extends Layout {
    constructor(property: string);
    decode(b: Buffer, offset: number): any;
    encode(src: number | any[] | any, b: Buffer, offset: number): number;
  }
}
