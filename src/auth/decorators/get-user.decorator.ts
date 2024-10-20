import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    // console.log({ ctx });
    // console.log({ data });
    const req = ctx.switchToHttp().getRequest();
    let user: User = req.user;

    if (data as keyof User) {
      user = user[data];
    }

    if (!user) {
      throw new InternalServerErrorException('User not found(request)');
    }
    return user;
  },
);
