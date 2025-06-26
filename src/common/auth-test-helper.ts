import { TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AddressEntity, UserEntity } from "../users/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { AuthService } from "../auth/auth.service";
import { AccountEntity } from "../accounts/account.entity";

export async function createTestUser(module: TestingModule): Promise<UserEntity> {
    const userRepo = module.get(getRepositoryToken(UserEntity)) as Repository<UserEntity>;

    return await userRepo.save({
        email: 'test@example.com',
        name: 'test',
        phoneNumber: '+447906924825',
        address: {
            line1: '58 Random Road',
            line2: 'Random Place',
            line3: 'Really Random Place',
            town: 'Random City',
            county: 'Random County',
            postcode: 'R1 3RR'
        } as AddressEntity,
        password: await bcrypt.hash('Password123!', 10),
    });
}

export async function clearTables(module: TestingModule) {
    try {
        const userRepo = module.get(getRepositoryToken(UserEntity)) as Repository<UserEntity>;

        if (userRepo) {
            userRepo.deleteAll();
        }
    } catch { }

    try {
        const accountsRepo = module.get(getRepositoryToken(AccountEntity)) as Repository<AccountEntity>;

        if (accountsRepo) {
            accountsRepo.deleteAll();
        }
    } catch { }
}

export async function createUserTokens(module: TestingModule, user: UserEntity) {
    const authService = module.get(AuthService) as AuthService;
    return authService.createJwtTokens(user);
}