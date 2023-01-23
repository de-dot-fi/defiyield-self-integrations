import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { getAllbridgeModule } from './modules/AllbridgePool';

const project: ProjectDefinitionInterface = {
  name: 'Allbridge core',
  categories: ['Cross Chain'],
  links: {
    logo: 'https://core.allbridge.io/assets/icons/favicons/favicon_192.png',
    url: 'https://core.allbridge.io/',
    discord: 'https://discord.com/invite/ASuPY8d3E6',
    telegram: 'https://t.me/allbridge_announcements',
    twitter: 'https://twitter.com/Allbridge_io',
    github: '',
  },
  modules: [getAllbridgeModule('ETH'), getAllbridgeModule('BSC')],
};

export default project;
