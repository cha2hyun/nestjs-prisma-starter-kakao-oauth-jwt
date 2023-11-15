import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { GqlAuthGuard } from "./gql-auth.guard";
import { JwtStrategy } from "./jwt.strategy";
import { PasswordService } from "./password.service";
import { SecurityConfig } from "../common/configs/config.interface";
import { HttpModule } from "@nestjs/axios";
import { KakaoLoginService } from "../users/kakao-oauth/kakao-oauth.service";

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>("security");
        return {
          secret: configService.get<string>("JWT_ACCESS_SECRET"),
          signOptions: {
            expiresIn: securityConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, GqlAuthGuard, PasswordService, KakaoLoginService],
  exports: [GqlAuthGuard],
})
export class AuthModule {}
