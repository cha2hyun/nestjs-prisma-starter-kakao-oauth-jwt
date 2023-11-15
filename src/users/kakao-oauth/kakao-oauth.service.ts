import { HttpService } from "@nestjs/axios";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";

import { KAKAO_API_URL, KAKAO_AUTH_URL } from "./kakao-oauth.const";
import { KakaoOauthToken, KakaoV2UserMe } from "./kakao-oauth.type";

@Injectable()
export class KakaoLoginService {
  httpService: HttpService;
  configService: ConfigService;
  constructor(httpService: HttpService, configService: ConfigService) {
    this.httpService = httpService;
    this.configService = configService;
  }

  async getToken(code: string, redirectUri: string): Promise<KakaoOauthToken> {
    try {
      const url = new URL("/oauth/token", KAKAO_AUTH_URL).href;
      const tokenResponse = await new Promise<KakaoOauthToken>((resolve, reject) => {
        this.httpService
          .post(
            url,
            new URLSearchParams({
              grant_type: "authorization_code",
              client_id: this.configService.get("KAKAO_API_CLIENT_ID"),
              client_secret: this.configService.get("KAKAO_API_CLIENT_SECRET"),
              code: code,
              redirect_uri: redirectUri,
            }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            },
          )
          .subscribe({
            error: err => reject(err),
            next: response => resolve(response.data),
          });
      });
      return tokenResponse;
    } catch (e) {
      const err = e as AxiosError;
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  async getUser(token: string) {
    try {
      const url = new URL("/v2/user/me", KAKAO_API_URL).href;
      const infoResponse = await new Promise<KakaoV2UserMe>((resolve, reject) => {
        this.httpService
          .get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "Content-type: application/x-www-form-urlencoded;charset=utf-8",
            },
            params: {
              secure_resource: true,
            },
          })
          .subscribe({
            error: err => reject(err),
            next: response => resolve(response.data),
          });
      });
      return infoResponse;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async validate(token: string): Promise<string> {
    try {
      const url = new URL("/v1/user/access_token_info", KAKAO_API_URL).href;
      const infoResponse = await new Promise<{ id: string }>((resolve, reject) => {
        this.httpService
          .get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .subscribe({
            error: err => reject(err),
            next: response => resolve(response.data),
          });
      });

      return infoResponse.id;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
