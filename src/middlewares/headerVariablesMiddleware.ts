import { Context } from '../core/core';
import { BaseMiddleware } from '../core/handler';
import { ValidationError } from '../core/errors';

export class HeaderVariablesMiddleware implements BaseMiddleware {
  constructor(private requiredHeaders: string[]) {}

  async before(context: Context): Promise<void> {
    context.req.headers = context.req.headers || {};

    for (const header of this.requiredHeaders) {
      if (!context.req.headers[header.toLowerCase()]) {
        throw new ValidationError(`Missing required header: ${header}`);
      }
    }
  }
}
