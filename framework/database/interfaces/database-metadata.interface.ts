import { PrimitiveValue } from "framework/common";

export interface DatabaseMetadata<Entity extends Record<string, PrimitiveValue>> {
  autoincrements: Partial<Record<keyof Entity, number | undefined>>;
}
