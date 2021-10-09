import { Logger, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, getRepository, IsNull, Not, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class IUpdateInput<T extends QueryDeepPartialEntity<T>> {
  id: number;
}

export interface IRelationalUpdateInput {
  id: number;
  relationIds: number[];
}

export interface IBaseDataService<T> {
  readonly repository: Repository<T>;
  readonly logger: Logger;
  create: (createInput: DeepPartial<T>) => Promise<T | boolean>;
  findAll: () => Promise<T[] | null>;
  findAllDeleted: () => Promise<T[] | null>;
  findByFieldAll: (field: string, lookupString: unknown) => Promise<T[] | null>;
  findByFieldOne: (field: string, lookupString: unknown) => Promise<T | null>;
  findMany: (ids: Array<number>) => Promise<T[] | null>;
  findOne: (id: number) => Promise<T | null>;
  update: (updateInput: IUpdateInput<T>) => Promise<T | boolean>;
  remove: (id: number) => Promise<boolean>;
  removeMany: (ids: number[]) => Promise<boolean>;
  addRelations: (
    relationalUpdateInput: IRelationalUpdateInput,
    relation,
  ) => Promise<T | boolean>;
  removeRelations: (
    relationalUpdateInput: IRelationalUpdateInput,
    relation,
  ) => Promise<T | boolean>;
  updateRelations: <U>(
    relationalUpdateInput: IRelationalUpdateInput,
    relation: string,
    relationalEntity: Constructor<U>,
  ) => Promise<T | boolean>;
}

type Constructor<I> = new (...args: any[]) => I; // Main Point

export function BaseDataService<T>(
  entity: Constructor<T>,
  service,
): Type<IBaseDataService<T>> {
  class DataServiceHost implements IBaseDataService<T> {
    readonly logger: Logger = new Logger(service.name);
    @InjectRepository(entity) public readonly repository: Repository<T>;

    async create(createInput: DeepPartial<T>) {
      try {
        return this.repository.save(createInput);
      } catch (error) {
        this.logger.log(error);
        return false;
      }
    }

    async findAll() {
      return await this.repository.find();
    }

    async findAllDeleted() {
      return await this.repository.find({
        withDeleted: true,
        where: { deleted: Not(IsNull()) },
      });
    }

    async findByFieldAll(
      field: string,
      lookupValue: string,
    ): Promise<T[] | null> {
      return await this.repository.find({ where: { [field]: lookupValue } });
    }

    async findByFieldOne(
      field: string,
      lookupValue: string,
    ): Promise<T | null> {
      return await this.repository.findOne({ where: { [field]: lookupValue } });
    }

    async findMany(ids: Array<number>): Promise<T[] | null> {
      return await this.repository.findByIds(ids);
    }

    async findOne(id: number): Promise<T | null> {
      return await this.repository.findOne(id);
    }

    async update(updateInput: IUpdateInput<T>) {
      const { id, ...updatedInfo } = updateInput;

      if (!(await this.repository.findOne(id))) {
        return false;
      }

      try {
        await this.repository.update(id, updatedInfo);
        return this.repository.findOne(id);
      } catch (error) {
        this.logger.log(error);
        return false;
      }
    }

    async remove(id: number): Promise<boolean> {
      if (!(await this.repository.findOne(id))) {
        return false;
      }

      try {
        await this.repository.softDelete(id);
        return true;
      } catch (error) {
        this.logger.log(error);
        return false;
      }
    }

    async removeMany(ids: number[]): Promise<boolean> {
      if (!(await this.repository.findByIds(ids))) {
        return false;
      }

      try {
        await this.repository.softDelete(ids);
        if (!(await this.repository.findByIds(ids))) {
          return true;
        }
        return true;
      } catch (error) {
        this.logger.log(error);
        return false;
      }
    }
    async addRelations(
      relationalUpdateInput: IRelationalUpdateInput,
      relation: string,
    ): Promise<T | boolean> {
      try {
        const { id, relationIds } = relationalUpdateInput;

        await this.repository
          .createQueryBuilder()
          .relation(entity, relation)
          .of(id)
          .add(relationIds);

        return await this.repository.findOne(id);
      } catch (error) {
        this.logger.log(error);
        return false;
      }
    }

    async removeRelations(
      relationalUpdateInput: IRelationalUpdateInput,
      relation: string,
    ): Promise<T | boolean> {
      try {
        const { id, relationIds } = relationalUpdateInput;

        await this.repository
          .createQueryBuilder()
          .relation(entity, relation)
          .of(id)
          .remove(relationIds);

        return await this.repository.findOne(id);
      } catch (error) {
        this.logger.log(error);
        return false;
      }
    }

    async updateRelations<U>(
      relationalUpdateInput: IRelationalUpdateInput,
      relation: string,
      relationalEntity: Constructor<U>,
    ): Promise<T | boolean> {
      try {
        const { id, relationIds } = relationalUpdateInput;
        const relationalRepository: Repository<U> =
          getRepository(relationalEntity);
        const record = await this.repository.findOne(id);
        record[relation] = await relationalRepository.findByIds(relationIds);

        return await this.repository.save(record);
      } catch (error) {
        this.logger.log(error);
        return false;
      }
    }
  }

  return DataServiceHost;
}
