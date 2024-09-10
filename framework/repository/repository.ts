import fs from "fs/promises";
import { MetadataKey, DATABASE_PATH } from "framework/common";
import { EntityConstructorType, ExtractEntity } from "./types";
import { GetOptions, WhereOption, WhereOptionMatcher } from "framework/options";
import { Database, DatabaseEntity } from "framework/database";

export class Repository<EntityConstructor extends EntityConstructorType> {
  private whereOptionsMatcher = new WhereOptionMatcher();

  private get entityName(): string {
    return Reflect.getMetadata(MetadataKey.ENTITY_NAME, this.entity);
  }

  private get primaryKeyName(): string {
    return Reflect.getMetadata(MetadataKey.PRIMARY_KEY_NAME, this.entity);
  }

  private get autoincrements(): (keyof ExtractEntity<EntityConstructor>)[] {
    return Reflect.getMetadata(MetadataKey.AUTOINCREMENTS, this.entity);
  }

  public constructor(private entity: EntityConstructor) {}

  create() {
    return new this.entity();
  }

  private createEntityFromPlainObject(item: Partial<ExtractEntity<EntityConstructor>>) {
    const entity = new this.entity();

    Object.keys(item).forEach((key) => {
      entity[key] = item[key];
    });

    return entity;
  }

  private async getDatabase(): Promise<Database<ExtractEntity<EntityConstructor>>> {
    const file = await fs.readFile(DATABASE_PATH);
    const fileContent = file.toString();
    return JSON.parse(fileContent);
  }

  private async getDatabaseEntities(): Promise<DatabaseEntity<ExtractEntity<EntityConstructor>>> {
    const database = await this.getDatabase();
    const databaseEntity = database[this.entityName];
    if (!databaseEntity) throw new Error(`There is not entities by name ${this.entityName}`);
    return databaseEntity;
  }

  private async updateDatabase(content: Record<string, any>) {
    return fs.writeFile(DATABASE_PATH, JSON.stringify(content, null, 2));
  }

  private getDefaultDatabaseEntity(): DatabaseEntity<ExtractEntity<EntityConstructor>> {
    return { _metadata: { autoincrements: {} }, items: [] };
  }

  async getMany(options?: GetOptions<EntityConstructor>): Promise<ExtractEntity<EntityConstructor>[]> {
    const { items } = await this.getDatabaseEntities();

    return items
      .filter((item) => {
        if (!options?.where) return true;
        const whereOptions = Object.entries(options.where) as Array<
          [
            keyof ExtractEntity<EntityConstructor>,
            WhereOption<ExtractEntity<EntityConstructor>[keyof ExtractEntity<EntityConstructor>]>
          ]
        >;

        return whereOptions.every(([key, whereOption]) => {
          if (!Array.isArray(whereOption)) {
            // If predicate is not an array, then checking it for matching
            return this.whereOptionsMatcher.checkIsMatching(item[key], whereOption);
          }

          // Else, checking every option in array for matching
          return whereOption.every((whereOption) => this.whereOptionsMatcher.checkIsMatching(item[key], whereOption));
        });
      })
      .map((item) => this.createEntityFromPlainObject(item))
      .map((entity) => {
        // Calling `beforeGet` hook if it is exists in entity
        if (typeof entity.beforeGet === "function") {
          entity = entity.beforeGet(entity);
        }

        return entity;
      });
  }

  async getOne(options?: GetOptions<EntityConstructor>): Promise<ExtractEntity<EntityConstructor> | undefined> {
    const [entity] = await this.getMany(options);
    return entity;
  }

  async insert(entity: Partial<ExtractEntity<EntityConstructor>> | Partial<ExtractEntity<EntityConstructor>>[]) {
    const database = await this.getDatabase();
    const objects = Array.isArray(entity) ? entity : [entity];

    database[this.entityName] ??= this.getDefaultDatabaseEntity();

    const entitiesToInsert = objects.map((object) => {
      let entity = this.createEntityFromPlainObject(object);

      const dbAutoincrements = database[this.entityName]!._metadata.autoincrements;
      const autoincrements = this.autoincrements;

      autoincrements.forEach((autoincrement) => {
        dbAutoincrements[autoincrement] ??= 0;
        const dbAutoincrement = dbAutoincrements[autoincrement];
        const lastValue = dbAutoincrement ?? 0;

        entity[autoincrement] = lastValue + 1;
        dbAutoincrements[autoincrement] = lastValue + 1;
      });

      // Calling `beforeInsert` hook if it is exists in entity
      if (typeof entity.beforeInsert === "function") {
        entity = entity.beforeInsert(entity);
      }

      return entity;
    });

    database[this.entityName]!.items = [...database[this.entityName]!.items, ...entitiesToInsert];

    await this.updateDatabase(database);

    return entitiesToInsert;
  }

  async remove(options?: GetOptions<EntityConstructor>): Promise<ExtractEntity<EntityConstructor>[]> {
    const items = await this.getMany(options);
    const database = await this.getDatabase();
    const primaryKeyValues = items.map((item) => item[this.primaryKeyName]);

    database[this.entityName] ??= this.getDefaultDatabaseEntity();
    const filteredItems =
      database[this.entityName]!.items.filter((item) => {
        return !primaryKeyValues.includes(item[this.primaryKeyName]);
      }) ?? [];
    database[this.entityName]!.items = filteredItems;

    await this.updateDatabase(database);

    return items;
  }
}
