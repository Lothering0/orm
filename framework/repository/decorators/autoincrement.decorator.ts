import { MetadataKey } from "framework/common";
import { getConstructorFromPrototype } from "../helpers";

export const Autoincrement =
  (value = true) =>
  (prototype: Record<string, any>, propertyKey: string) => {
    const entityConstructor = getConstructorFromPrototype(prototype);
    let autoincrements: string[] = Reflect.getMetadata(MetadataKey.AUTOINCREMENTS, entityConstructor) ?? [];

    if (value) {
      autoincrements.push(propertyKey);
    } else {
      autoincrements.filter((key) => key !== propertyKey);
    }

    Reflect.defineMetadata(MetadataKey.AUTOINCREMENTS, autoincrements, entityConstructor);
  };
