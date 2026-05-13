import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    if (exception instanceof HttpException) {
      const exRes = exception.getResponse();
      if (typeof exRes === 'object' && exRes !== null) {
        const msg = (exRes as any).message;
        message = Array.isArray(msg) ? msg.join('; ') : String(msg);
      } else {
        message = String(exRes);
      }
    } else {
      message = 'Internal server error';
    }

    response.status(status).json({
      code: status * 100,
      message,
      data: null,
    });
  }
}
