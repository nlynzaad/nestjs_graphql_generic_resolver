import { Query, Mutation, Args, Int, Resolver } from '@nestjs/graphql';
import { IBaseDataService, IUpdateInput } from './base.service';
import { DeepPartial } from 'typeorm';
import { capitalize } from 'lodash';
import { BaseEntity } from './entities/base.entity';
import { Type } from '@nestjs/common';

export function BaseResolver<T extends Type<unknown>>(entity: T): any {
  @Resolver({ isAbstract: true })
  abstract class BaseResolverHost {
    protected constructor(private readonly BaseService: IBaseDataService<T>) {}

    @Query(() => [entity], {
      name: `get${capitalize(entity.name)}s`,
      nullable: true,
    })
    findAll() {
      return this.BaseService.findAll();
    }

    @Query(() => entity, {
      name: `get${capitalize(entity.name)}`,
      nullable: true,
    })
    findOne(@Args('id', { type: () => Int }) id: number) {
      return this.BaseService.findOne(id);
    }

    @Query(() => entity, {
      name: `get${capitalize(entity.name)}ByName`,
      nullable: true,
    })
    findByFieldOne(@Args('name', { type: () => String }) name: string) {
      return this.BaseService.findByFieldOne('name', name);
    }

    @Mutation(() => entity, { name: `create${capitalize(entity.name)}` })
    create(
      @Args({
        type: () => entity,
        name: `create${capitalize(entity.name)}Input`,
      })
      createInput: DeepPartial<T>,
    ): Promise<T | boolean> {
      return this.BaseService.create(createInput);
    }

    @Mutation(() => entity, { name: `update${capitalize(entity.name)}` })
    update(
      @Args({
        type: () => entity,
        name: `update${capitalize(entity.name)}Input`,
      })
      updateInput: IUpdateInput<unknown>,
    ) {
      return this.BaseService.update(updateInput);
    }

    @Mutation(() => entity, { name: `remove${capitalize(entity.name)}` })
    remove(@Args('id', { type: () => Int }) id: number) {
      return this.BaseService.remove(id);
    }
  }

  return BaseResolverHost;
}
