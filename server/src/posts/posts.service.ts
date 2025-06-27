import { HttpException, Injectable } from '@nestjs/common';
import { Http2ServerRequest } from 'http2';
import { decode, verify } from 'jsonwebtoken';
import { prisma } from 'src/prisma';

@Injectable()
export class PostsService {
  async get(authHeader: string) {
    try {
      if (!authHeader || !verify(authHeader, process.env.SECRET as string)) {
        throw new HttpException('Unauthorized', 401);
      }

      const decoded: { username: string; id: number } = (await decode(
        authHeader,
      )) as { username: string; id: number };

      const posts = await prisma.post.findMany({
        where: {
          authorId: {
            not: {
              equals: decoded.id,
            },
          },
          viewedUsers: {
            none: {
              id: decoded.id,
            },
          },
        },
        include: {
          viewedUsers: true,
          author: true,
        },
      });

      if (posts.length === 0) {
        throw new HttpException('No posts found', 404);
      }

      await posts.map(async (post) => {
        await prisma.post.update({
          where: {
            id: post.id,
          },
          data: {
            viewedUsers: {
              connect: {
                id: decoded.id,
              },
            },
          },
        });
      });

      return { posts };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error; // Re-throw known exceptions
      }
      throw new HttpException('Server error', 500);
    }
  }
  async createPost(authHeader: string, title: string, content: string) {
    try {
      if (!authHeader || !verify(authHeader, process.env.SECRET as string)) {
        throw new HttpException('Unauthorized', 401);
      }
      if (!title || !content || title.trim() === '' || content.trim() === '') {
        throw new HttpException('Title and content are required', 400);
      }

      const decoded: { username: string; id: number } = decode(authHeader) as {
        username: string;
        id: number;
      };

      const post = await prisma.post.create({
        data: {
          authorId: decoded.id,
          title,
          content,
        },
      });

      return { post };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error; // Re-throw known exceptions
      }
      throw new HttpException('Server error', 500);
    }
  }
  async userPosts(authHeader: string, page: number) {
    try {
      if (!authHeader || !verify(authHeader, process.env.SECRET as string)) {
        throw new HttpException('Unauthorized', 401);
      }

      const decoded: { username: string; id: number } = (await decode(
        authHeader,
      )) as { username: string; id: number };

      const skip = (page - 1) * 5;
      const posts = await prisma.post.findMany({
        where: {
          authorId: {
            equals: decoded.id,
          },
        },
        include: {
          viewedUsers: true,
          author: true,
        },
        take: 5,
        skip: skip,
      });

      if (posts.length === 0) {
        throw new HttpException('No posts found', 404);
      }
      return { posts };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error; // Re-throw known exceptions
      }
      throw new HttpException('Server error', 500);
    }
  }
}
