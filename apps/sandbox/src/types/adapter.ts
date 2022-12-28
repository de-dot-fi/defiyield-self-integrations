import type { ModuleDefinitionInterface, ProjectDefinitionInterface } from './module';

export interface AdapterOptions {
  name: string;
  path: string;
}

export interface AdapterInterface extends ProjectDefinitionInterface {
  name: string;
  modules: ModuleDefinitionInterface[];
}
