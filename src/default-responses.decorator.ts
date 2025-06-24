import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiProperty, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string[] | string;
}

class BadRequestErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: ['property blahBlah should not exist', 'property accountType should be one of these values [GBP] '] })
  message: string[];
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

export function ApiDefaultResponses() {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Invalid details supplied', type: BadRequestErrorResponse }),
    ApiUnauthorizedResponse({ description: 'Access token is missing or invalid', type: UnauthorisedErrorResponse }),
    ApiForbiddenResponse({ description: 'The user is not allowed to access this resource', type: ForbiddenErrorResponse }),
    ApiInternalServerErrorResponse({ description: 'An unexpected error occurred', type: InternalServerErrorResponse }),
  );
}