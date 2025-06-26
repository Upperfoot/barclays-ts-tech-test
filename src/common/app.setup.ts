import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ValidationFilter } from "./validation.filter";


export function setupApp(app: INestApplication<any>) {
    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // important for class-transformer + Swagger
    }),
  );
  app.useGlobalFilters(new ValidationFilter());
}