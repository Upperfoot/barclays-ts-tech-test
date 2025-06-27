import { applyDecorators, BadRequestException, CanActivate, createParamDecorator, ExecutionContext, Injectable, UseGuards } from "@nestjs/common";
import { ApiHeader } from "@nestjs/swagger";

const IDEMPOTENCY_HEADER_KEY = 'Idempotency-Key';

@Injectable()
export class IdempotencyKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers[IDEMPOTENCY_HEADER_KEY.toLowerCase()];

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    if (typeof idempotencyKey !== 'string' || !uuidRegex.test(idempotencyKey)) {
      throw new BadRequestException('Idempotency-Key must be a valid UUID');
    }

    request.idempotencyKey = idempotencyKey;

    return true;
  }
}

export function applyIdempotencyHeader() {
    return applyDecorators(
        ApiHeader({
            name: IDEMPOTENCY_HEADER_KEY,
            description: 'A unique key to ensure the request is idempotent',
            required: true,
            schema: { type: 'string' },
        }),
        UseGuards(IdempotencyKeyGuard)
    );
}

export const GetIdempotencyKey = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.idempotencyKey;
    },
);

export type IdempotentRequest = { idempotencyKey: string };