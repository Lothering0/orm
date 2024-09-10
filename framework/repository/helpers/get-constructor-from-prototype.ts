import { EntityConstructorType } from "../types";

export const getConstructorFromPrototype = <EntityConstructor extends EntityConstructorType>(
  prototype: Record<string, any>
): EntityConstructor => {
  return prototype.constructor as any;
};
