import { errorHandler, ErrorHandlerMiddleware } from './errorHandlerMiddleware';
import { Context, HttpError, logger } from '../core';

jest.mock('../core/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('ErrorHandlerMiddleware', () => {
  let context: Context;
  let middleware: ErrorHandlerMiddleware;

  beforeEach(() => {
    context = {
      req: {},
      res: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      },
      container: null,
      error: null,
      businessData: new Map(),
    } as unknown as Context;
    middleware = new ErrorHandlerMiddleware();
  });

  it('logs the error and returns 500 for generic errors', async () => {
    const error = new Error('Generic error');
    await middleware.onError(error, context);

    expect(logger.error).toHaveBeenCalledWith('Error processing request', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    expect(context.res.status).toHaveBeenCalledWith(500);
    expect(context.res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });

  it('logs the error and returns the correct status and message for HttpError', async () => {
    const error = new HttpError(
      404,
      'Not Found',
      undefined,
      'Resource not found'
    );
    await middleware.onError(error, context);

    expect(logger.error).toHaveBeenCalledWith('Error processing request', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    expect(context.res.status).toHaveBeenCalledWith(404);
    expect(context.res.json).toHaveBeenCalledWith({
      error: error.message,
      details: 'Resource not found',
    });
  });
  it('handles errors without a stack trace', async () => {
    const error = new Error('No stack trace');
    error.stack = undefined;
    await middleware.onError(error, context);

    expect(logger.error).toHaveBeenCalledWith('Error processing request', {
      errorMessage: error.message,
      errorStack: undefined,
    });
    expect(context.res.status).toHaveBeenCalledWith(500);
    expect(context.res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });

  it('handles errors without a message', async () => {
    const error = new Error();
    error.message = '';
    await middleware.onError(error, context);

    expect(logger.error).toHaveBeenCalledWith('Error processing request', {
      errorMessage: '',
      errorStack: error.stack,
    });
    expect(context.res.status).toHaveBeenCalledWith(500);
    expect(context.res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });
});

describe('errorHandler', () => {
  let context: Context;
  let middleware: ReturnType<typeof errorHandler>;

  beforeEach(() => {
    context = {
      req: {},
      res: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      },
      container: null,
      error: null,
      businessData: new Map(),
    } as unknown as Context;
    middleware = errorHandler();
  });

  it('logs the error and returns 500 for generic errors', async () => {
    const error = new Error('Generic error');
    if (middleware.onError) {
      await middleware.onError(error, context);
    }

    expect(logger.error).toHaveBeenCalledWith('Error processing request', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    expect(context.res.status).toHaveBeenCalledWith(500);
    expect(context.res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });

  it('logs the error and returns the correct status and message for HttpError', async () => {
    const error = new HttpError(
      404,
      'Not Found',
      undefined,
      'Resource not found'
    );
    if (middleware.onError) {
      await middleware.onError(error, context);
    }

    expect(logger.error).toHaveBeenCalledWith('Error processing request', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    expect(context.res.status).toHaveBeenCalledWith(404);
    expect(context.res.json).toHaveBeenCalledWith({
      error: error.message,
      details: 'Resource not found',
    });
  });

  it('handles errors without a stack trace', async () => {
    const error = new Error('No stack trace');
    error.stack = undefined;
    if (middleware.onError) {
      await middleware.onError(error, context);
    }

    expect(logger.error).toHaveBeenCalledWith('Error processing request', {
      errorMessage: error.message,
      errorStack: undefined,
    });
    expect(context.res.status).toHaveBeenCalledWith(500);
    expect(context.res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });

  it('handles errors without a message', async () => {
    const error = new Error();
    error.message = '';
    if (middleware.onError) {
      await middleware.onError(error, context);
    }

    expect(logger.error).toHaveBeenCalledWith('Error processing request', {
      errorMessage: '',
      errorStack: error.stack,
    });
    expect(context.res.status).toHaveBeenCalledWith(500);
    expect(context.res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });
});
