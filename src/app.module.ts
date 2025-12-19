import { Module } from '@nestjs/common';
import { UserModule } from './module/user/user.module.js';
@Module({
  imports: [UserModule],
})
export class AppModule { }
