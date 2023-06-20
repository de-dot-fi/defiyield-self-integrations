import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { KordFiLending } from './modules/KordFiLending';
import { KordFiLeverageFarming } from './modules/KordFiLeverageFarming';

const project: ProjectDefinitionInterface = {
  name: 'Kord.Fi',
  categories: ['Lending'],
  links: {
    logo: 'https://icons.de.fi/icons/studio/protocols/kord-fi.webp',
    url: 'https://kord.fi',
    discord: 'https://discord.com/invite/RCb4v4tEV9',
    telegram: 'https://t.me/kord_fi',
    twitter: 'https://twitter.com/kord_fi',
  },
  modules: [KordFiLending, KordFiLeverageFarming],
};

export default project;
