import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsPhoneNumber, IsString, IsStrongPassword } from "class-validator";
import { AddressEntity, UserEntity } from "../user.entity";
import { RequestHandler } from "../../common/interfaces";

export class Address implements AddressEntity {
    @ApiProperty()
    line1: string;

    @ApiProperty()
    line2: string;

    @ApiProperty()
    line3: string;

    @ApiProperty()
    town: string;

    @ApiProperty()
    county: string;

    @ApiProperty()
    postcode: string;
}

export class CreateUserRequest {
    @ApiProperty({
        description: 'The name of the user.',
        example: 'Joe Bloggs',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'joe@bloggs.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '+447912345678'
    })
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty({
        example: 'MajorRabbit23!1@'
    })
    @IsStrongPassword()
    password: string;

    @ApiProperty()
    address: Address;
}

export class UserResponse {
    @ApiProperty({
        example: 'Joe Bloggs'
    })
    name: string;

    @ApiProperty({
        example: 'joe@bloggs.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '+447912345678'
    })
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty()
    address: Address;
}

export function mapUser(userEntity: UserEntity) {
    return {
        name: userEntity.name,
        email: userEntity.email,
        phoneNumber: userEntity.phoneNumber,
        address: userEntity.address
    }
}

@Injectable()
export class CreateUserHandler implements RequestHandler {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repo: Repository<UserEntity>
    ) { }

    async handle(request: CreateUserRequest): Promise<UserResponse> {
        const entity = this.repo.create({
            name: request.name,
            email: request.email,
            phoneNumber: request.phoneNumber,
            address: request.address,
        });

        try {
            const savedUser = await this.repo.save(entity);
            return mapUser(savedUser);
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