import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/transform/transform.interceptor.js';
import { HttpExceptionFilter } from './common/filter/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局响应转换器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 注册全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置全局验证管道，启用详细的错误信息
  app.useGlobalPipes(
    new ValidationPipe({
      // 自动转换类型
      transform: true,
      // 自动去除未定义的属性
      whitelist: true,
      // 禁止未定义的属性
      forbidNonWhitelisted: true,
      // 启用详细的错误信息
      enableDebugMessages: true,
      // 禁用详细错误堆栈（生产环境）
      disableErrorMessages: false,
      // 自定义错误响应格式
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints || {};
          return {
            field: error.property,
            message: Object.values(constraints)[0] || '参数校验失败',
            value: error.value,
          };
        });
        return new BadRequestException(messages);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
