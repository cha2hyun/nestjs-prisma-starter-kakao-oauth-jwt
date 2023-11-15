# Instructions

🚀 This project is generated from [notiz-dev/nestjs-prisma-starter](https://github.com/notiz-dev/nestjs-prisma-starter) starter template which is referenced in the [NestJS official documentation](https://docs.nestjs.com/recipes/prisma). If you need more information, such as installation and setup, please check [README](https://github.com/notiz-dev/nestjs-prisma-starter#readme) within the template.

👀 This project provides Kakao Oauth login with Passport JWT authentication.

📝 Feel free to let me know if encounter any errors or have any questions. Pull requests are welcome.

<br>

## Features

- Validate with id (or email) given by kakao oauth

<br>

## Overview

### 1. Setup a kakao sdk in your frontend.

Please check [kakao documents](https://developers.kakao.com/docs/latest/ko/javascript/download) for setup

<br>


### 2. Login with kakao account. 
<img width="1014" alt="image" src="https://github.com/cha2hyun/nestjs-prisma-starter-kakao-oauth-jwt/assets/56015532/6030789f-9fc0-4e55-80e8-4271d6929b51">

Here are some Next.js frontend code examples

```ts
<Script
  src="https://t1.kakaocdn.net/kakao_js_sdk/2.1.0/kakao.min.js"
  integrity="sha384-dpu02ieKC6NUeKFoGMOKz6102CLEWi9+5RQjWSV0ikYSFFd8M3Wp2reIcquJOemx"
  crossOrigin="anonymous"
  onReady={() => {
    if (!("Kakao" in window)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Kakao == null) return;
    if (process.env.NEXT_PUBLIC_KAKAO_JS_KEY == null) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).Kakao;
    if (kakao.isInitialized() !== true) {
      kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
    }
  }}
/>
```
> Add kakao sdk on `_app.tsx`

```ts
const handleLogin = useCallback(async () => {
  if (!("Kakao" in window)) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).Kakao == null) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kakao = (window as any).Kakao;
  kakao.Auth.authorize({
    redirectUri: typeof window !== "undefined" ? window.location.origin + "/auth/kakao" : null,
    prompts: "login",
  });
}, []);
```
> In this case redirect url is `/auth/kakao`

<br>


### 3. Get Code Parameter.

If your account passes the login, the browser will redirect to your `redirectUri` with `code` parameters. 
<img width="1020" alt="image" src="https://github.com/cha2hyun/nestjs-prisma-starter-kakao-oauth-jwt/assets/56015532/77d7364f-70e6-4d37-b024-be0fb26f7df9">
> The URL will look like `http://localhost:3002/auth/kakao?code=TJx7M1-sTWkrKQgvOTmfvSUnC5bD2GqtWrA....`

<br>



### 4. Perform a Mutatuib and Await Server Response

On your redirect page, initiate a login mutation to the Nest.js server using  `code` and `redirectUri` as variables.

For instance, here are some Next.js frontend code snippets.

```ts
/* eslint-disable no-console */
import { Spinner } from "@nextui-org/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useLoginMutation } from "@/src/core/config/graphql";
import Authentication from "@/src/core/function/authentication"

const KakaoOauth: NextPage = () => {
  const router = useRouter();
  const [login] = useLoginMutation();
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    const params = new URL(document.location.toString()).searchParams;
    const code = params.get("code");
    const fetchData = async () => {
      try {
        if (code && typeof window !== undefined && !isFetched) {
          await login({
            variables: {
              code: code,
              redirectUri: window.location.origin + "/auth/kakao",
            },
            onCompleted: async res => {
              setIsFetched(true);
              Authentication.setToken({
                accessToken: res.login.accessToken,
                refreshToken: res.login.refreshToken,
              });
              console.log("jwt", res.login.accessToken);
            },
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [isFetched, login, router]);

  return (
    <div className="bg-defualt my-20 flex w-full justify-center ">
      <div className="mx-auto w-full flex-1 text-center ">
        <Spinner label="Waiting for server response..." color="warning" />
      </div>
    </div>
  );
};

export default KakaoOauth;
```

> `auth/kakao.tsx`

<br>


### 5. Returning JWT Token on the Nest.js server

#### First, `auth.reslover.ts`

```ts
@Mutation(() => Auth)
async login(
  @Args("code") code: string,
  @Args("redirectUri")
  redirectUri: string,
) {
  const { accessToken, refreshToken } = await this.auth.kakaoLogin(code, redirectUri);
  return {
    accessToken,
    refreshToken,
  };
```
> src > auth > auth.resolver.ts

it will call kakaoLogin functions in `auth.service.ts`

<br>

#### Second in `auth.service.ts` It will fetch the `kakao access token` using the `code` and `redirectUri` parameters.

```ts
async kakaoLogin(code: string, redirectUri: string): Promise<Token> {
  try {
    const tokenResponse = await this.kakaoLoginService.getToken(code, redirectUri);
    const kakaoUser = await this.kakaoLoginService.getUser(tokenResponse.access_token);
    const isJoined = await this.prisma.user.findUnique({ where: { kakaoId: kakaoUser.id.toString() } });
    if (!isJoined) {
      return this.createUser({
        kakaoId: kakaoUser.id.toString(),
        email: kakaoUser.kakao_account.email,
        nickname: kakaoUser.properties.nickname,
        connectedAt: kakaoUser.connected_at,
        ageRange: kakaoUser.kakao_account.age_range,
        birthday: kakaoUser.kakao_account.birthday,
        gender: kakaoUser.kakao_account.gender,
        profileImageUrl: kakaoUser.properties.profile_image,
        thumbnailImageUrl: kakaoUser.properties.thumbnail_image,
      });
    }
    else {
      const userId = (await this.prisma.user.findUnique({ where: { kakaoId: kakaoUser.id.toString() } })).id;
      return this.generateTokens({
        userId: userId,
      });
    }
  } catch (e) {
    throw new Error(e);
  }
}
```

> src > auth > auth.service.ts


```ts
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
```

<br>

#### Third, it will attempt to retrieve `Kakao user information` using the `access-code`
```ts
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
```

<br>

#### Fourth, utilizing the `id` from `kakao user information` to validate wheater the user already exist on database. If not it will create a new user and generate a JWT token associated with the `userId`, returning it.

```ts
async createUser(payload: SignupInput): Promise<Token> {
  try {
    const user = await this.prisma.user.create({
      data: {
        kakaoId: payload.kakaoId,
        email: payload.email,
        nickname: payload.nickname,
        ageRange: payload.ageRange,
        birthday: payload.birthday,
        gender: payload.gender,
        role: "USER",
        kakaoProfile: {
          create: {
            profileImageUrl: payload.profileImageUrl,
            thumbnailImageUrl: payload.thumbnailImageUrl,
            connectedAt: payload.connectedAt,
          },
        },
      },
    });  
    return this.generateTokens({
      userId: user.id,
    });
  } catch (e) {
    throw new Error(e);
  }
}
```

<br>

#### Fifthly, if the user already exists on database. It will return a JWT token genertated with the `userId`

<br>


### 6. Saving Returned JWT Token on your frontend

The token will be returned to frontend. ensure to save it within the browser.

<img width="1012" alt="image" src="https://github.com/cha2hyun/nestjs-prisma-starter-kakao-oauth-jwt/assets/56015532/3788177a-9ba5-42b3-874f-8882c1cb02aa">

Token will be like

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbG95aDBydXIwMDAwM2hvYm9taTl3N21iIiwiaWF0IjoxNzAwMDM2MTA4LCJleHAiOjE3MDAwMzYyMjh9.M1YjIJcKjeUfYo4P8Humh7fAtc4PAxRI54tJAJDP
```

<br>

### 7. Execute the 'Me' query using JWT tokens.

Add Authorization header with your JWT tokens to retrieve 'Me'
`Authorization : Bearer "YOUR JWT TOKENS"`

<img width="1327" alt="스크린샷 2023-11-15 오후 5 28 01" src="https://github.com/cha2hyun/nestjs-prisma-starter-kakao-oauth-jwt/assets/56015532/7a883a36-0f8b-47bd-bf6d-b798c5b353b8">

> on success


<img width="1325" alt="image" src="https://github.com/cha2hyun/nestjs-prisma-starter-kakao-oauth-jwt/assets/56015532/1ac02c0d-3c37-484b-900e-0b3469efe3a8">

> with worng token

<br>

### 8. Begin building your own projects 🚀



