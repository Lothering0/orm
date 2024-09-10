import { MetadataKey } from "framework/common";
import { getConstructorFromPrototype } from "../helpers";

export const Primary = () => (prototype: Record<string, any>, propertyKey: string) => {
  const entityConstructor = getConstructorFromPrototype(prototype);
  Reflect.defineMetadata(MetadataKey.PRIMARY_KEY_NAME, propertyKey, entityConstructor);
};
