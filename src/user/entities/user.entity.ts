import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { BaseEntity } from 'src/base/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
@InputType('UserInput')
@ObjectType()
export class User extends BaseEntity {
  @Column({ nullable: false })
  @Field({ description: 'Firstname of user' })
  firstname: string;

  @Column({ nullable: false })
  @Field({ description: 'Surname of user' })
  surname: string;
}
