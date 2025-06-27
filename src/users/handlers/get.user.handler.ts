import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { AuthenticatedRequest, RequestHandler } from '../../common/interfaces';
import { mapUser, UserResponse } from './create.user.handler';

@Injectable()
export class GetUserHandler implements RequestHandler {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async handle(request: AuthenticatedRequest): Promise<UserResponse> {
    const user = await this.repo.findOne({
      where: {
        uuid: request.userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return mapUser(user);
  }
}
