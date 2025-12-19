import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { UserModule } from './user.module.js';
import request from 'supertest';


describe('UserController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let createdUserId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [UserModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        // 清理测试数据
        if (createdUserId) {
            try {
                await prismaService.user.delete({ where: { id: createdUserId } });
            } catch (error) {
                // 忽略删除错误
            }
        }
        await app.close();
    });

    describe('/user (POST)', () => {
        it('应该成功创建用户', () => {
            const createUserDto = {
                name: '测试用户',
                email: 'test@example.com',
                password: '123456',
            };

            return request(app.getHttpServer())
                .post('/user')
                .send(createUserDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.name).toBe(createUserDto.name);
                    expect(res.body.email).toBe(createUserDto.email);
                    expect(res.body).not.toHaveProperty('password');
                    createdUserId = res.body.id;
                });
        });

        it('应该拒绝重复的邮箱', async () => {
            const createUserDto = {
                name: '另一个用户',
                email: 'test@example.com',
                password: '123456',
            };

            return request(app.getHttpServer())
                .post('/user')
                .send(createUserDto)
                .expect(500);
        });

        it('应该拒绝缺少必填字段的请求', () => {
            const createUserDto = {
                name: '测试用户',
                // 缺少 email 和 password
            };

            return request(app.getHttpServer())
                .post('/user')
                .send(createUserDto)
                .expect(400);
        });
    });

    describe('/user (GET)', () => {
        it('应该返回用户列表', () => {
            return request(app.getHttpServer())
                .get('/user')
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    if (res.body.length > 0) {
                        expect(res.body[0]).toHaveProperty('id');
                        expect(res.body[0]).toHaveProperty('name');
                        expect(res.body[0]).toHaveProperty('email');
                        expect(res.body[0]).not.toHaveProperty('password');
                    }
                });
        });
    });

    describe('/user/:id (GET)', () => {
        it('应该返回指定用户', () => {
            if (!createdUserId) {
                return Promise.resolve();
            }

            return request(app.getHttpServer())
                .get(`/user/${createdUserId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id', createdUserId);
                    expect(res.body).toHaveProperty('name');
                    expect(res.body).toHaveProperty('email');
                    expect(res.body).not.toHaveProperty('password');
                });
        });

        it('应该返回 404 当用户不存在时', () => {
            return request(app.getHttpServer())
                .get('/user/99999')
                .expect(404);
        });

        it('应该返回 400 当 ID 不是数字时', () => {
            return request(app.getHttpServer())
                .get('/user/abc')
                .expect(400);
        });
    });

    describe('/user/:id (PATCH)', () => {
        it('应该成功更新用户', () => {
            if (!createdUserId) {
                return Promise.resolve();
            }

            const updateUserDto = {
                name: '更新后的用户名',
            };

            return request(app.getHttpServer())
                .patch(`/user/${createdUserId}`)
                .send(updateUserDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body.name).toBe(updateUserDto.name);
                    expect(res.body.id).toBe(createdUserId);
                });
        });

        it('应该返回 404 当用户不存在时', () => {
            return request(app.getHttpServer())
                .patch('/user/99999')
                .send({ name: '新名字' })
                .expect(404);
        });
    });

    describe('/user/:id (DELETE)', () => {
        it('应该成功删除用户', () => {
            if (!createdUserId) {
                return Promise.resolve();
            }

            return request(app.getHttpServer())
                .delete(`/user/${createdUserId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(createdUserId);
                });
        });

        it('应该返回 404 当用户不存在时', () => {
            return request(app.getHttpServer())
                .delete('/user/99999')
                .expect(404);
        });
    });
});

