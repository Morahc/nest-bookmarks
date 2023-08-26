import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userservice: UserService) {}

  @Get('me')
  getMe(@GetUser('id') userId: User['id']) {
    return this.userservice.getMe(userId);
  }

  @Patch()
  updateMe(@GetUser('id') userId: User['id'], @Body() body: EditUserDto) {
    return this.userservice.editMe(userId, body);
  }
}
