import {
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  UseGuards,
  Param,
  ParseIntPipe,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(private bookmarkservice: BookmarkService) {}

  @Get()
  getBookmarks(@GetUser('id') userId: User['id']) {
    return this.bookmarkservice.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: User['id'],
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkservice.getBookmarkById(userId, bookmarkId);
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: User['id'],
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkservice.createBookmark(userId, dto);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: User['id'],
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarkservice.editBookmarkById(userId, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: User['id'],
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkservice.deleteBookmarkById(userId, bookmarkId);
  }
}
