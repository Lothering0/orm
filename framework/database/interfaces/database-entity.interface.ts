import { PrimitiveValue } from "framework/common";
import { DatabaseMetadata } from "./database-metadata.interface";

export interface DatabaseEntity<Entity extends Record<string, PrimitiveValue>> {
  _metadata: DatabaseMetadata<Entity>;
  items: Entity[];
}
