import { createTestProject, MockContracts } from '@defiyield/testing';
import { join } from 'path';
import { describe, test, beforeEach } from 'vitest';
import { CroSwap } from '../modules/CroSwap';

const mockContracts: MockContracts = {
  fallback: {
    //
  },
};

describe('#project #CroSwap #todo', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'CroSwap',
      path: join(__dirname, '../index.ts'),
      modules: [CroSwap],
      contracts: mockContracts,
    });
  });

  // test("fetches all tokens", async ({ project }) => {
  //   // console.log(tokens)
  // })

  // test("fetches all pools", async ({ project }) => {
  //   // console.log(pools)
  // })

  test.todo('Calculates the correct reward apr for active pools');

  test.todo('Calculates 0 apr for inactive pools');
});
