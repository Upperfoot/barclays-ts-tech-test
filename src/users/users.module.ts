import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { UsersController } from './users.controller';
import { CreateUserHandler } from './handlers/create.user.handler';
import { GetUserHandler } from './handlers/get.user.handler';
import { PatchUserHandler } from './handlers/patch.user.handler';
import { DeleteUserHandler } from './handlers/delete.user.handler';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService, CreateUserHandler, GetUserHandler, PatchUserHandler, DeleteUserHandler],
  exports: [UsersService]
})
export class UsersModule {}
