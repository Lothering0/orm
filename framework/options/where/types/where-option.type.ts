import { PrimitiveValue } from "framework/common";
import { AdvancedWhereOption } from "./advanced-where-option.type";

export type WhereOption<Value extends PrimitiveValue> = Value | AdvancedWhereOption<Value>;
