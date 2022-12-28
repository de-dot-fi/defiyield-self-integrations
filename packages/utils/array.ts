export function range(start: number, end: number): number[] {
  return [...new Array(end).keys()].map((a) => a + start);
}

export function chunk<T>(array: T[], chunkSize: number) {
  return array.reduce((all: T[][], one: T, i: number) => {
    const ch = Math.floor(i / chunkSize);
    all[ch] = ([] as T[]).concat(all[ch] || [], one);
    return all;
  }, []);
}

export function findToken<T extends { address: string }>(tokens: T[]) {
  return (address: string): T => {
    const t = tokens.find((token) => token.address.toLowerCase() === address.toLowerCase());
    if (!t) {
      throw new Error(`Failed to find token - (${address})`);
    }
    return t;
  };
}

// TODO: any[] should be ethcall Call[]
interface Call {
  contract: {
    address: string;
  };
  name: string;
  inputs: readonly unknown[];
  outputs: readonly unknown[];
  params: unknown;
}

// TODO: types for ethcallProvider
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMulticallChunker(ethcallProvider: any) {
  return async <T>(array: T[], callback: (item: T, index: number, orginal: T[]) => Call[]) => {
    const groups: number[] = [];

    const calls = array.flatMap((...args) => {
      const rawResults = callback(...args);
      // co-erce into an array if none was returned
      const results = Array.isArray(rawResults) ? rawResults : [rawResults];
      groups.push(results.length);
      return results;
    });

    const final = [];
    const results = await ethcallProvider.all(calls);
    for (const group of groups) {
      final.push(results.splice(0, group));
    }
    return final;
  };
}
