import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getMe(userId: User['id']) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async editMe(userId: User['id'], input: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: input,
    });

    return user;
  }
}
