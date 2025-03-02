import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const responseSchema = {
        statusCode: status,
        message: exceptionResponse['message'] || exception.message,
        error: exceptionResponse['error'] || 'Error',
        timestamp: new Date().toISOString(),
    }

    if(process.env.NODE_ENV === 'development') {
        responseSchema['path'] = request.url;
        responseSchema['method'] = request.method;
    }

    response
      .status(status)
      .json(responseSchema);
  }
}

