## Goals

- Consume a single protocols adapter, and serve a visually appealing UI to list
  - all used tokens
  - all pools
  - platform meta (links, logo, etc)
  - check user positions (interactive)
- Test Suite to ensure all info is formatted properly.

## Getting Started

```bash
yarn install @defiyield/sandbox
```

```ts
import { serve } from '@defiyield/sandbox';

import myProtocolAdapter from './adapters/myProtocolAdapter';

// starts WebUI server
serve(myProtocolAdapter);
```
