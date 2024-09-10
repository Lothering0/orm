import { WhereOptions } from "framework/options/where";
import { EntityConstructorType } from "framework/repository/types";

export interface GetOptions<Entity extends EntityConstructorType> extends WhereOptions<Entity> {}
