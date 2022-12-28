import { vi } from 'vitest';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : unknown extends T[P]
    ? T[P]
    : DeepPartial<T[P]>;
};

export type PartialFuncReturn<T> = {
  [K in keyof T]?: T[K] extends (...args: infer A) => infer U
    ? (...args: A) => PartialFuncReturn<U>
    : DeepPartial<T[K]>;
};

const createRecursiveMockProxy = (): unknown => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache = new Map<string | number | symbol, any>();

  const proxy = new Proxy(
    {},
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (obj: any, prop: any) => {
        const propName = prop.toString();
        if (cache.has(prop)) {
          return cache.get(prop);
        }

        const checkProp = obj[prop];

        const mockedProp =
          prop in obj
            ? typeof checkProp === 'function'
              ? vi.fn()
              : checkProp
            : propName === 'then'
            ? undefined
            : createRecursiveMockProxy();

        cache.set(prop, mockedProp);

        return mockedProp;
      },
    },
  );

  return vi.fn(() => proxy);
};

export type MockOptions = {
  name?: string;
};

export const createMock = <T extends object>(partial: PartialFuncReturn<T> = {}): T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache = new Map<string | number | symbol, any>();

  const proxy = new Proxy(partial, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (obj: any, prop: any) => {
      if (
        prop === 'constructor' ||
        prop === 'inspect' ||
        prop === 'then' ||
        (typeof prop === 'symbol' && prop.toString() === 'Symbol(util.inspect.custom)')
      ) {
        return undefined;
      }

      if (cache.has(prop)) {
        return cache.get(prop);
      }

      const checkProp = obj[prop];

      const mockedProp =
        prop in obj
          ? typeof checkProp === 'function'
            ? vi.fn(checkProp)
            : checkProp
          : createRecursiveMockProxy();

      cache.set(prop, mockedProp);
      return mockedProp;
    },
  });

  return proxy as T;
};
