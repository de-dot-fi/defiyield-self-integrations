---
to: projects/<%= h.inflection.camelize(project.replace(/-/g, '_')) %>/index.ts
---
import type { ProjectDefinitionInterface } from '@defiyield/sandbox';
import { ExampleFarm } from './modules/ExampleFarm'

const project: ProjectDefinitionInterface = {
  name: '<%= h.inflection.camelize(project.replace(/-/g, '_')) %>',
  categories: [],
  links: {
    logo: '',
    url: '',
    discord: '',
    telegram: '',
    twitter: '',
    github: '',
  },
  modules: [ ExampleFarm ],
};

export default project;


