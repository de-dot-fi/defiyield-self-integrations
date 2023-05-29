import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { getAllbridgeModule } from './modules/AllbridgePool';

const project: ProjectDefinitionInterface = {
  name: 'Allbridge core',
  categories: ['Cross Chain'],
  links: {
    logo: 'https://icons.de.fi/icons/studio/protocols/allbridge.webp',
    url: 'https://core.allbridge.io/',
    discord: 'https://discord.com/invite/ASuPY8d3E6',
    telegram: 'https://t.me/allbridge_announcements',
    twitter: 'https://twitter.com/Allbridge_io',
    github: '',
  },
  modules: [getAllbridgeModule('ETH'), getAllbridgeModule('BSC')],
};

export default project;
