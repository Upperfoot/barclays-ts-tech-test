import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../user.entity";
import { AuthenticatedRequest, RequestHandler } from "../../common/interfaces";

@Injectable()
export class DeleteUserHandler implements RequestHandler {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repo: Repository<UserEntity>
    ) { }

    async handle(request: AuthenticatedRequest): Promise<boolean> {
        const user = await this.repo.findOne({
            where: {
                uuid: request.userId
            } 
        });

        if(!user) {
            throw new NotFoundException('User not found')
        }

        await this.repo.delete(user.id);

        return true;
    }
}