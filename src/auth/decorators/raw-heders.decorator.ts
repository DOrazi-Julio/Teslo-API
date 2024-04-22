import {
    ExecutionContext,
    InternalServerErrorException,
    createParamDecorator,
  } from '@nestjs/common';
  
  export const RowHeaders = createParamDecorator((data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.rawHeaders;
  });
  