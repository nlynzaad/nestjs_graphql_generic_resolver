import { InputType, Field } from '@nestjs/graphql';

@InputType('createUserInput')
export class CreateUserInput {
  @Field({ description: 'Firstname of user' })
  firstname: string;

  @Field({ description: 'Surname of user' })
  surname: string;
}
