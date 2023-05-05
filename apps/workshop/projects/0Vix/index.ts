import { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { Lending0Vix } from './lending';

export default {
  name: '0VIX',
  categories: ['Lending'],
  links: {
    url: 'https://www.0vix.com/',
    logo: 'https://icons.de.fi/icons/studio/protocols/0vix.webp',
    discord: 'https://discord.gg/VxW9Vg6krk',
    telegram: 'https://t.me/OVIXProtocol',
    twitter: 'https://twitter.com/0vixProtocol',
    github: 'https://github.com/0Vix/0vix-contracts',
  },
  modules: [Lending0Vix],
} as ProjectDefinitionInterface;
