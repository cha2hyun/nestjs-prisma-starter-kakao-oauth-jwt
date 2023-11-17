import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsEmail } from 'class-validator';
import 'reflect-metadata';

import { BaseModel } from '../../common/models/base.model';
import { Post } from '../../posts/models/post.model';

registerEnumType(Role, {
  name: 'Role',
  description: 'User role',
});

@ObjectType()
export class User extends BaseModel {
  @Field(() => String, { nullable: true })
  kakaoId: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => Role)
  role: Role;

  @Field(() => [KakaoProfile], { nullable: true })
  kakaoProfile?: [KakaoProfile] | null;

  @Field(() => [Post], { nullable: true })
  posts?: [Post] | null;

  @Field(() => String, { nullable: true })
  nickname?: string;

  @Field(() => String, { nullable: true })
  ageRange?: string;

  @Field(() => String, { nullable: true })
  birthday?: string;

  @Field(() => String, { nullable: true })
  gender?: string;
}

@ObjectType()
export class KakaoProfile {
  @Field(() => String, { nullable: true })
  connectedAt?: string;

  @Field(() => String, { nullable: true })
  profileImageUrl?: string;

  @Field(() => String, { nullable: true })
  thumbnailImageUrl?: string;
}
