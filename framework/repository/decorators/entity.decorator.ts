import { MetadataKey } from "framework/common";
import { EntityConstructorType, EntityName } from "../types";

export const Entity = (name: EntityName) => (entity: EntityConstructorType) => {
  Reflect.defineMetadata(MetadataKey.ENTITY_NAME, name, entity);
};
