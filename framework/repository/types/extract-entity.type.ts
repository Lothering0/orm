import { EntityConstructorType } from "./entity-constructor.type";

export type ExtractEntity<T extends EntityConstructorType> = T extends new (...args: any[]) => infer Entity
  ? Entity
  : never;
