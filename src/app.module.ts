import { Module } from '@nestjs/common';
import { HelloModule } from './module/hello/hello.module';
import { UserModule } from './module/user/user.module';
@Module({
  imports: [HelloModule, UserModule],
})
export class AppModule {}
