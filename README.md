# Eagle Bank – Take-Home Tech Test (API)

Thanks for reviewing this submission. This repo contains a RESTful API for a fictional bank, designed to align with a provided OpenAPI spec and scenario-based functional requirements.

It’s built using **TypeScript + NestJS**, and you can read more about that choice in [docs/TECHNOLOGY.md](docs/TECHNOLOGY.md).

Also I've documented my Journey with videos on specific milestones (Accounts, Users, Authentication and Transactions) in the [docs/videos](docs/videos). directory

## Pre-Project setup

This assumes you have nvm (Node Version Manager) installed, if not you can run the below command

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Make sure you reload your shell config, or start a new terminal to use the nvm command

## Project setup

```bash
# install LTS version of Node + NPM (Important to always use stable LTS versions)
$ nvm install --lts

# set current terminal to use LTS version of Node + NPM
$ nvm use --lts
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# optional - production mode
$ npm run start:prod
```

Once running from above commands - navigate here [Swagger Playground + Documentation](http://localhost:3000/api)

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

Current coverage is 

File                             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------------|---------|----------|---------|---------|-------------------
All files                        |   97.07 |     86.2 |   97.61 |    97.2 |  

## 📚 Additional Docs

- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [Take Home Test/Spec Review](docs/SPEC_REVIEW.md)
- [Technology & Framework Choices](docs/TECHNOLOGY.md)
- [Engineering Methodology](docs/ENGINEERING.md)
- [Living Project Log](docs/THINKING.md)

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
