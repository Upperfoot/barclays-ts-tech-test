import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupApp } from './common/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Take home tech task')
    .setDescription('We want you to create a REST API for Eagle Bank which conforms to this OpenAPI specification which allows a user to create, fetch, update and delete a bank account and deposit or withdraw money from the account. These will be stored as transactions against a bank account which be retrieved but not modified or deleted.')
    .setVersion('1.0')
    .addSecurity('bearerAuth', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Bearer Token in JWT format'
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  setupApp(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
