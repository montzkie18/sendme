import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * This is a placeholder for the Authentication system
 * which should provide a valid userId for every request.
 */

export const TEST_USER_ID = 'c1d06b09-0d48-4479-9de4-84b69606601c';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id ?? TEST_USER_ID;
  },
);
