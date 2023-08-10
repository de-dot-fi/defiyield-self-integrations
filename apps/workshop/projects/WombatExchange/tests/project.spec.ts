import { createTestProject, MockContracts } from '@defiyield/testing';
import { join } from 'path';
import { describe, test, expect, beforeEach } from 'vitest';

const mockContracts: MockContracts = {
  fallback: {
    //
  },
};

describe('#project #WombatExchange #todo', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'WombatExchange',
      path: join(__dirname, '../index.ts'),
      // modules: [/** Your Module Here **/],
      contracts: mockContracts,
    });
  });

  test.todo('Fetches all the expected tokens');

  test.todo('Fetches all the expected pools');

  test.todo('Calculates the correct reward apr for active pools');

  test.todo('Calculates 0 apr for inactive pools');
});
