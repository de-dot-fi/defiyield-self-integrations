---
to: projects/<%= h.inflection.camelize(project.replace(/-/g, '_')) %>/modules/ExampleFarm.ts
---
import type { ModuleDefinitionInterface } from "@defiyield/sandbox";

export const ExampleFarm: ModuleDefinitionInterface = {
  name: 'ExampleFarm',
  chain: 'ethereum',
  type: 'staking',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens(ctx) {
    // TODO: Fetch Token addresses
    return []
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools(ctx) {
    // TODO: Fetch Available Pools
    return []
  },

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions(ctx) {
    // TODO: Fetch User Positions
    return []
  },
};
