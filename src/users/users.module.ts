import { Module } from '@nestjs/common';

import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { PasswordService } from '../auth/password.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KakaoLoginService } from './kakao-oauth/kakao-oauth.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [UsersResolver, UsersService, PasswordService, KakaoLoginService],
})
export class UsersModule {}
