import { Injectable } from '@nestjs/common';
import { BaseDataService } from 'src/base/base.service';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends BaseDataService(User, this) {}
