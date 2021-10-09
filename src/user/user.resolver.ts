import { Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { BaseResolver } from 'src/base/base.resolver';
import { Logger } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UserResolver extends BaseResolver(
  User,
  CreateUserInput,
  UpdateUserInput,
) {
  private logger: Logger;
  constructor(private readonly userService: UserService) {
    super(userService);
    this.logger = new Logger();
  }
}
