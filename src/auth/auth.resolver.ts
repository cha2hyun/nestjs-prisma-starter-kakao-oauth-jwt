import { Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { AuthService } from "./auth.service";
import { RefreshTokenInput } from "./dto/refresh-token.input";
import { Auth } from "./models/auth.model";
import { Token } from "./models/token.model";
import { User } from "../users/models/user.model";

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => Auth)
  async login(
    @Args("code", { description: "카카오 인가 코드" }) code: string,
    @Args("redirectUri", { description: "카카오 리다이렉트 URI" })
    redirectUri: string,
  ) {
    const { accessToken, refreshToken } = await this.auth.kakaoLogin(code, redirectUri);
    return {
      accessToken,
      refreshToken,
    };
  }

  @Mutation(() => Token)
  async refreshToken(@Args() { token }: RefreshTokenInput) {
    return this.auth.refreshToken(token);
  }

  @ResolveField("user", () => User)
  async user(@Parent() auth: Auth) {
    return await this.auth.getUserFromToken(auth.accessToken);
  }
}
