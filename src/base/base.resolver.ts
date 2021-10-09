import { Query, Mutation, Args, Int, Resolver } from '@nestjs/graphql';
import { IBaseDataService, IUpdateInput } from './base.service';
import { DeepPartial } from 'typeorm';
import { capitalize } from 'lodash';
import { Type } from '@nestjs/common';

type Constructor<I> = new (...args: any[]) => I; // Main Point

export interface IBaseResolver<T> {
  readonly BaseService: IBaseDataService<T>;
  findAll: () => Promise<T[] | null>;
  findOne: (id: number) => Promise<T | null>;
  findByFieldAll: (field: string, lookupValue: string) => Promise<T[] | null>;
  findByFieldOne: (field: string, lookupValue: string) => Promise<T | null>;
  create: (createInput: DeepPartial<T>) => Promise<T | boolean>;
  update: (updateInput: IUpdateInput<T>) => Promise<T | boolean>;
  remove: (id: number) => Promise<boolean>;
}

export function BaseResolver<T, C, U>(
  entityType: Constructor<T>,
  createInputType: C,
  updateInputType: U,
): Type<IBaseResolver<T>> {
  @Resolver({ isAbstract: true })
  class BaseResolverHost implements IBaseResolver<T> {
    constructor(readonly BaseService: IBaseDataService<T>) {}

    @Query(() => [entityType], {
      name: `get${capitalize(entityType.name)}s`,
      nullable: true,
    })
    findAll() {
      return this.BaseService.findAll();
    }

    @Query(() => entityType, {
      name: `get${capitalize(entityType.name)}`,
      nullable: true,
    })
    findOne(@Args('id', { type: () => Int }) id: number) {
      return this.BaseService.findOne(id);
    }

    @Query(() => [entityType], {
      name: `getAll${capitalize(entityType.name)}ByField`,
      nullable: true,
    })
    findByFieldAll(
      @Args({ type: () => String, name: 'field' }) field: string,
      @Args({ type: () => String, name: 'lookupValue' }) lookupValue: string,
    ) {
      return this.BaseService.findByFieldAll(field, lookupValue);
    }

    @Query(() => entityType, {
      name: `get${capitalize(entityType.name)}ByField`,
      nullable: true,
    })
    findByFieldOne(
      @Args({ type: () => String, name: 'field' }) field: string,
      @Args({ type: () => String, name: 'lookupValue' }) lookupValue: string,
    ) {
      return this.BaseService.findByFieldOne(field, lookupValue);
    }

    @Mutation(() => entityType, {
      name: `create${capitalize(entityType.name)}`,
    })
    create(
      @Args({
        type: () => createInputType,
        name: `create${capitalize(entityType.name)}Input`,
      })
      createInput: DeepPartial<T>,
    ): Promise<T | boolean> {
      return this.BaseService.create(createInput);
    }

    @Mutation(() => entityType, {
      name: `update${capitalize(entityType.name)}`,
    })
    update(
      @Args({
        type: () => updateInputType,
        name: `update${capitalize(entityType.name)}Input`,
      })
      updateInput: IUpdateInput<T>,
    ) {
      return this.BaseService.update(updateInput);
    }

    @Mutation(() => entityType, {
      name: `remove${capitalize(entityType.name)}`,
    })
    remove(@Args('id', { type: () => Int }) id: number) {
      return this.BaseService.remove(id);
    }
  }

  return BaseResolverHost;
}
