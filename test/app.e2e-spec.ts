import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common/interfaces';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => app.close());

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'john@domain.com',
      password: '12345678',
    };
    describe('Sign up', () => {
      it('should throw error if email is email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('should throw error if password is email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should throw error if no body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Sign in', () => {
      it('should throw error if email is email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw error if password is email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw error if no body', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201)
          .stores('userAt', 'access_token'); //user access token - userAt variable name
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });
    describe('Edit me', () => {
      const dto: EditUserDto = {
        firstname: 'John',
        lastname: 'Doe',
      };
      it('should get current user', () => {
        return pactum
          .spec()
          .patch('/user')
          .withBody(dto)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectBodyContains(dto.lastname);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmarks', () => {
      const dto: CreateBookmarkDto = {
        title: 'Title test',
        link: 'Test Link',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmark')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLength(1);
      });

      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectBodyContains('title');
      });
    });

    describe('Edit bookmarks', () => {
      const dto: EditBookmarkDto = {
        description: 'Test Description',
      };
      it('should edit bookmark with id', () => {
        return pactum
          .spec()
          .patch('/bookmark/{id}')
          .withBody(dto)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Delete bookmarks', () => {
      it('should edit bookmark with id', () => {
        return pactum
          .spec()
          .delete('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(204);
      });
    });
  });
});
