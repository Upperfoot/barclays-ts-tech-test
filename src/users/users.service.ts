
import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repo: Repository<UserEntity>
    ) { }

    async findOne(details: { email: string }): Promise<UserEntity | null> {
        return this.repo.findOne({ where: details })
    }
}
