## Goals

This repo aims to be the simplest way to enable the community to create their own integrations for use in the DefiYield dashboard

- Boilerplate Code Generator
- CLI to serve WebUI
- CLI to run tests
- optional? typescript support
- prettier/eslint
- how to use ABI's => preload ABI's from database?
- CLI tool to fetch an ABI & generate types
- typechain to generate types/contracts for all ABI's

### Needed Examples

- masterchef
- lending
- airdrop/claimable
- liquidity pools
- locked balance variations (lock schedule, etc)

## Getting Started

1. Create a Project folder and index.ts in `projects/` or run `yarn workshop make MyProject` to generate the boilerplate
2. Create the adapter
3. Test with the UI using `yarn workshop start MyProject`
4. Run the test suite `yarn workshop test MyProject`
