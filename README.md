# NestJS Server

基于 NestJS 构建的 RESTful API 服务器，使用 Prisma ORM 和 MySQL 数据库。

## 技术栈

- **框架**: [NestJS](https://nestjs.com/) v11
- **语言**: TypeScript
- **ORM**: [Prisma](https://www.prisma.io/) v6
- **数据库**: MySQL
- **验证**: class-validator, class-transformer
- **包管理**: pnpm

## 项目特性

- ✅ 统一的 API 响应格式
- ✅ 全局参数校验，返回详细的错误信息
- ✅ 全局异常处理
- ✅ TypeScript + ESM 模块系统
- ✅ Prisma ORM 集成
- ✅ RESTful API 设计

## 项目结构

```
src/
├── common/              # 公共模块
│   ├── filter/         # 异常过滤器
│   ├── transform/      # 响应转换器
│   └── prisma.service.ts
├── module/             # 业务模块
│   └── user/          # 用户模块
│       ├── dto/       # 数据传输对象
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── user.module.ts
├── app.module.ts       # 根模块
└── main.ts            # 应用入口
```

## 环境要求

- Node.js >= 18
- pnpm >= 8
- MySQL >= 8.0

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
PORT=3000
```

### 3. 数据库迁移

```bash
# 生成 Prisma Client
pnpm run prisma:generate

# 运行数据库迁移
pnpm run prisma:migrate

# 或者直接推送 schema（开发环境）
pnpm run prisma:push
```

### 4. 启动项目

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产模式
pnpm run start:prod

# 调试模式
pnpm run start:debug
```

应用将在 `http://localhost:3000` 启动。

## API 文档

### 用户模块

#### 创建用户

```http
POST /user
Content-Type: application/json

{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 获取所有用户

```http
GET /user
```

#### 获取单个用户

```http
GET /user/:id
```

#### 更新用户

```http
PATCH /user/:id
Content-Type: application/json

{
  "name": "李四",
  "email": "lisi@example.com"
}
```

#### 删除用户

```http
DELETE /user/:id
```

## 响应格式

所有 API 响应都遵循统一的格式：

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 错误响应

#### 参数校验失败

```json
{
  "code": 400,
  "message": "参数校验失败",
  "data": [
    {
      "field": "email",
      "message": "email must be an email",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "password must be longer than or equal to 8 characters",
      "value": "123"
    }
  ]
}
```

#### 其他错误

```json
{
  "code": 404,
  "message": "用户 ID 1 不存在",
  "data": null
}
```

## 参数校验

项目使用 `class-validator` 进行参数校验，支持以下验证规则：

- `@IsString()` - 字符串类型
- `@IsEmail()` - 邮箱格式
- `@IsNotEmpty()` - 非空
- `@MinLength(n)` - 最小长度
- `@MaxLength(n)` - 最大长度
- `@IsOptional()` - 可选字段

### 用户 DTO 示例

```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
```

## Prisma 命令

```bash
# 生成 Prisma Client
pnpm run prisma:generate

# 创建并应用迁移
pnpm run prisma:migrate

# 部署迁移（生产环境）
pnpm run prisma:migrate:deploy

# 打开 Prisma Studio（数据库可视化工具）
pnpm run prisma:studio

# 推送 schema 到数据库（开发环境）
pnpm run prisma:push
```

## 开发

### 代码格式化

```bash
pnpm run format
```

### 代码检查

```bash
pnpm run lint
```

### 运行测试

```bash
# 单元测试
pnpm run test

# 监听模式
pnpm run test:watch

# 覆盖率
pnpm run test:cov

# E2E 测试
pnpm run test:e2e
```

## 构建

```bash
# 构建项目
pnpm run build

# 构建后的文件在 dist/ 目录
```

## 配置说明

### ValidationPipe 配置

项目在 `main.ts` 中配置了全局 ValidationPipe：

- `transform: true` - 自动转换类型
- `whitelist: true` - 自动去除未定义的属性
- `forbidNonWhitelisted: true` - 禁止未定义的属性
- 自定义错误响应格式，包含字段名、错误消息和值

### 全局拦截器

- `TransformInterceptor` - 统一响应格式转换

### 全局异常过滤器

- `HttpExceptionFilter` - 统一异常处理和响应格式

## 数据库 Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## 许可证

[MIT licensed](LICENSE)
