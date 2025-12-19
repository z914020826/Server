import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

/**
 * 响应状态码枚举
 */
export enum ResponseCode {
    SUCCESS = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

/**
 * 创建统一格式的 API 响应
 * @param data 响应数据
 * @param code 状态码，默认为 200
 * @param message 响应消息，默认为 'success'
 */
export function createApiResponse<T>(
    data: T,
    code: number = ResponseCode.SUCCESS,
    message: string = 'success',
): ApiResponse<T> {
    return {
        code,
        message,
        data,
    };
}


/**
 * 统一响应格式转换器
 * 将所有接口返回值统一包装为 { code, message, data } 格式
 */
@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((data) => {
                // 否则包装成统一结构
                return createApiResponse(data);
            }),
        );
    }
}

