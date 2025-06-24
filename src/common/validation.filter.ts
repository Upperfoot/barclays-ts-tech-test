import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse() as any;

    const details = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message.map((msg: string) => {
          const [field, ...rest] = msg.split(' ');
          return {
            field,
            message: msg,
            type: 'ValidationError',
          };
        })
      : [];

    response.status(400).json({
      message: 'Validation failed',
      details,
    });
  }
}
