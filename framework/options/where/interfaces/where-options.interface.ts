import { EntityConstructorType, ExtractEntity } from "framework/repository/types";
import { WhereOption } from "../types";

export interface WhereOptions<Entity extends EntityConstructorType> {
  where: {
    [key in keyof ExtractEntity<Entity>]?:
      | WhereOption<ExtractEntity<Entity>[key]>
      | WhereOption<ExtractEntity<Entity>[key]>[];
  };
}
