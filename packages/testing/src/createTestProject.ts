import { AdapterOptions, initializeProviders, Project, Token } from '@defiyield/sandbox';
import { ModuleDefinitionInterface, ClassBasedModuleDefinitionInterface } from '@defiyield/sandbox';
import { createMockContextForProvider, createMockProviderMap } from './createMockContext';
import { MockContracts } from './interfaces/MockContract';

function createFakeToken({ address }: { address: string; chainId: number }): Token {
  return {
    address,
    name: 'Fake Token',
    symbol: 'fake',
    decimals: 18,
    price: 10,
    underlying: [],
  };
}

export async function createTestProject(
  options: AdapterOptions & {
    modules?: (ModuleDefinitionInterface | ClassBasedModuleDefinitionInterface)[];
    contracts?: MockContracts;
    fetchToken?: (token: { address: string; chainId: number }) => Token;
  },
) {
  const { name, path, modules, contracts, fetchToken } = options;

  const providers = contracts ? createMockProviderMap(contracts) : await initializeProviders();

  if (!contracts) {
    // eslint-disable-next-line no-console
    console.warn(
      '\x1b[33m\x1b[4m%s\x1b[0m', // yellow, underlined
      `No mock contracts in place. Using live network results in test`,
    );
  }

  const tokenFetcher = (requests: { address: string; chainId: number }[]) =>
    Promise.resolve(
      requests.map((request) => (fetchToken ? fetchToken(request) : createFakeToken(request))),
    );

  const project = new Project(
    {
      name,
      path,
    },
    providers, // mock internal providers
    createMockContextForProvider,
    tokenFetcher,
  );

  // Override modules to be tested here
  await project.init({ modules });

  return project;
}
