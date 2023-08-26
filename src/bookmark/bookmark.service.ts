import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bookmark, User } from '@prisma/client';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async getBookmarks(userId: User['id']) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmarkById(userId: User['id'], bookmarkId: Bookmark['id']) {
    return this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  async createBookmark(userId: User['id'], dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: { ...dto, userId },
    });
    return bookmark;
  }

  async editBookmarkById(
    userId: User['id'],
    bookmarkId: Bookmark['id'],
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark with id not found');
    }
    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: { ...dto },
    });
  }

  async deleteBookmarkById(userId: User['id'], bookmarkId: Bookmark['id']) {
    return await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }
}
