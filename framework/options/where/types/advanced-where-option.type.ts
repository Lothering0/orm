import { PrimitiveValue } from "framework/common";

export type AdvancedWhereOption<T extends PrimitiveValue> = { equalsTo?: T } & (T extends string
  ? {
      startsWith?: string;
      endsWith?: string;
      contains?: string;
      pattern?: RegExp;
    }
  : T extends number
  ? {
      lessThan?: number;
      lessThanOrEquals?: number;
      moreThan?: number;
      moreThanOrEquals?: number;
    }
  : { equalsTo?: T });
