import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiProperty, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string[] | string;
}

export class ValidationDetail {
  @ApiProperty()
  field: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  type: string;
}

export class BadRequestErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Validation failed' })
  message: string[];

  @ApiProperty({ example: [
    {
      field: "name",
      message: "name must be a string",
      type: "ValidationError"
    }
  ], type: [ValidationDetail] })
  details: ValidationDetail[]
}

class UnauthorisedErrorResponse {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;

  @ApiProperty({ example: 'Access token is missing or invalid' })
  message: string;
}

export class ForbiddenErrorResponse {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: 'Forbidden' })
  error: string;

  @ApiProperty({ example: 'Access token is missing or invalid' })
  message: string;
}

export class InternalServerErrorResponse {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: 'Internal Server Error' })
  error: string;

  @ApiProperty({ example: 'Unexpected error occurred' })
  message: string;
}

export class ConflictErrorResponse {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Conflict' })
  error: string;

  @ApiProperty({ example: 'Name must be unique' })
  message: string;
}

export function ApiDefaultResponses() {
  return applyDecorators(
    ApiUnauthorizedResponse({ description: 'Access token is missing or invalid', type: UnauthorisedErrorResponse }),
    ApiForbiddenResponse({ description: 'The user is not allowed to access this resource', type: ForbiddenErrorResponse }),
    ApiInternalServerErrorResponse({ description: 'An unexpected error occurred', type: InternalServerErrorResponse }),
  );
}

export function GuardedApiEndpoints() {
  return applyDecorators(
      ApiSecurity('bearerAuth'),
      UseGuards(JwtGuard)
  )
}