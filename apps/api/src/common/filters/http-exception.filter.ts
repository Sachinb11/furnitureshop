import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exRes = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof exRes === 'object' && exRes !== null
      ? (exRes as any).message ?? 'Error'
      : exRes ?? 'Internal server error';
    if (status >= 500) this.logger.error(`${req.method} ${req.url}`, (exception as any)?.stack);
    res.status(status).json({ success: false, statusCode: status, message, path: req.url, timestamp: new Date().toISOString() });
  }
}
