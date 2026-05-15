declare module 'bn.js' {
  type BNInput = BN | bigint | number | string | number[] | Uint8Array | Buffer;
  type Endianness = 'be' | 'le';

  export default class BN {
    constructor(value: BNInput, base?: number | string, endian?: Endianness);

    static isBN(value: unknown): value is BN;

    toArrayLike(
      arrayType: typeof Buffer,
      endian?: Endianness,
      length?: number,
    ): Buffer;
    toString(base?: number | string): string;
  }
}
