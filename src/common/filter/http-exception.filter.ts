import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse, ResponseCode, createApiResponse } from '../transform/transform.interceptor.js';

/**
 * 全局异常过滤器
 * 统一处理所有异常，返回统一的响应格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = '服务器内部错误';
        let errors: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || exception.message || '请求失败';

                // 如果是验证错误，提取详细的错误信息
                if (Array.isArray(responseObj.message)) {
                    errors = responseObj.message;
                    message = '参数校验失败';
                } else if (responseObj.message) {
                    message = responseObj.message;
                }
            } else {
                message = exception.message || '请求失败';
            }
        } else if (exception instanceof Error) {
            message = exception.message || '服务器内部错误';
        }

        const apiResponse: ApiResponse = {
            code: status,
            message,
            data: errors || null,
        };

        response.status(status).json(apiResponse);
    }
}
