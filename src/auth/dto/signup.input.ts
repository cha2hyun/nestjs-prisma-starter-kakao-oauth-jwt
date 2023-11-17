import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class SignupInput {
  @IsNotEmpty()
  kakaoId: string;

  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  nickname?: string;

  @Field({ nullable: true })
  connectedAt?: string;

  @Field({ nullable: true })
  ageRange?: string;

  @Field({ nullable: true })
  birthday?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  profileImageUrl?: string;

  @Field({ nullable: true })
  thumbnailImageUrl?: string;
}

@InputType()
export class KakaoProfileSignupInput {
  @Field({ nullable: true })
  profileImageUrl?: string;

  @Field({ nullable: true })
  thumbnailImageUrl?: string;
}
