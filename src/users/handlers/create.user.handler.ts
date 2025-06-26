import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, ValidateNested } from "class-validator";
import { AddressEntity, UserEntity } from "../user.entity";
import { RequestHandler } from "../../common/interfaces";
import * as bcrypt from "bcrypt";
import { Type } from "class-transformer";

export class Address implements AddressEntity {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    line1: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    line2: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    line3: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    town: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    county: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
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
    @IsObject()
    @Type(() => Address)
    @ValidateNested({ each: true })
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
            password: await bcrypt.hash(request.password, 10)
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