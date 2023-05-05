import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { PLPStaking } from './modules/PLPStaking';

const project: ProjectDefinitionInterface = {
  name: 'Perp88',
  categories: ['Derivatives'],
  links: {
    logo: 'https://icons.de.fi/icons/studio/protocols/perp88.webp',
    url: 'https://perp88.com/',
    discord: 'https://discord.com/invite/DDr7r7jjCv',
    telegram: 'https://t.me/Perp88',
    twitter: 'https://twitter.com/0xPerp88',
    github: 'https://github.com/perp88',
  },
  modules: [PLPStaking],
};

export default project;
