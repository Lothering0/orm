import { PrimitiveValue } from "framework/common";
import { DatabaseEntity } from "./database-entity.interface";

export interface Database<Entity extends Record<string, PrimitiveValue>> {
  [entityName: string]: DatabaseEntity<Entity>;
}
