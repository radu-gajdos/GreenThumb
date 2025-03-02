import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../interfaces/payload.interface';

export const CurrentUser = createParamDecorator(
  async (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user : JwtUser = request.user;
    return data ? user?.[data] : user;
  },
);