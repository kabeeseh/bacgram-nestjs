import { HttpException, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { prisma } from 'src/prisma';

@Injectable()
export class AuthService {
  async signup(username: string, password: string) {
    try {
      if (!username || !password || username == '' || password == '')
        throw new HttpException('Username and password are required', 400);
      const userCheck = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (userCheck) throw new HttpException('User already exists', 400);

      const user = await prisma.user.create({
        data: {
          username,
          password: await hash(password, 10),
        },
      });

      const token = await sign(
        { id: user.id, username },
        process.env.SECRET as string,
      );

      return { token };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw known exceptions
      }
      throw new HttpException('Server error', 500);
    }
  }
  async login(username: string, password: string) {
    try {
      if (!username || !password || username == '' || password == '')
        throw new HttpException('Username and password are required', 400);

      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (!user) throw new HttpException('User not found', 404);

      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) throw new HttpException('Invalid credentials', 401);

      const token = await sign(
        { id: user.id, username },
        process.env.SECRET as string,
      );

      return { token };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw known exceptions
      }
      throw new HttpException('Server error', 500);
    }
  }
}
