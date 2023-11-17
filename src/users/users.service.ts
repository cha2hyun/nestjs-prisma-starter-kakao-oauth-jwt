import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { UpdateUserInput } from './dto/update-user.input';
import { PasswordService } from '../auth/password.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  updateUser(userId: string, newUserData: UpdateUserInput) {
    return this.prisma.user.update({
      data: newUserData,
      where: {
        id: userId,
      },
    });
  }

  // async changePassword(userId: string, userPassword: string, changePassword: ChangePasswordInput) {
  //   const passwordValid = await this.passwordService.validatePassword(changePassword.oldPassword, userPassword);

  //   if (!passwordValid) {
  //     throw new BadRequestException("Invalid password");
  //   }

  //   const hashedPassword = await this.passwordService.hashPassword(changePassword.newPassword);

  //   return this.prisma.user.update({
  //     data: {
  //       password: hashedPassword,
  //     },
  //     where: { id: userId },
  //   });
  // }
}
