import { Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { BaseResolver } from 'src/base/base.resolver';
import { Logger } from '@nestjs/common';

@Resolver(() => User)
export class UserResolver extends BaseResolver(User) {
  private logger: Logger;
  constructor(private readonly userService: UserService) {
    super(userService);
    this.logger = new Logger();
  }
}
