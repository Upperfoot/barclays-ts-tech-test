import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, ValidateNested } from "class-validator";
import { AddressEntity, UserEntity } from "../user.entity";
import { AuthenticatedRequest, RequestHandler } from "../../common/interfaces";
import * as bcrypt from "bcrypt";
import { Type } from "class-transformer";
import { Address, mapUser, UserResponse } from "./create.user.handler";

export class PatchUserRequest {
    @ApiProperty({
        description: 'The name of the user.',
        example: 'Joe Bloggs',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: '+447912345678'
    })
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty()
    @IsObject()
    @Type(() => Address)
    @ValidateNested({ each: true })
    address: Address;
}

type AuthenticatedPatchRequest = AuthenticatedRequest & { data: PatchUserRequest };

@Injectable()
export class PatchUserHandler implements RequestHandler {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repo: Repository<UserEntity>
    ) { }

    async handle(request: AuthenticatedPatchRequest): Promise<UserResponse> {
        const user = (await this.repo.findOne({ where: { uuid: request.userId } }));

        if (!user) {
            throw new NotFoundException('User not found');
        }

        try {
            const savedUser = await this.repo.save({
                id: user.id,
                name: request.data.name,
                phoneNumber: request.data.phoneNumber,
                address: request.data.address
            });

            return mapUser({ ...user, ...savedUser });
        } catch (err) {
            const isAccountNameUniqueViolation =
                err instanceof QueryFailedError &&
                /UNIQUE constraint failed: users.email/.test((err as any).message);

            if (isAccountNameUniqueViolation) {
                throw new ConflictException('Name must be unique');
            }

            throw err;
        }
    }
}