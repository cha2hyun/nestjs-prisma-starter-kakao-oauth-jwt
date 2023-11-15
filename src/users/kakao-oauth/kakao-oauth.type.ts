export type KakaoOauthToken = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
};

export type KakaoV2UserMe = {
  id: string;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image: string;
    thumbnail_image: string;
  };
  kakao_account: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname: string;
      thumbnail_image_url: string;
      profile_image_url: string;
      is_default_image: boolean;
    };
    has_email?: boolean;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
    has_age_range?: boolean;
    age_range_needs_agreement: string;
    age_range: string;
    has_birthday?: boolean;
    birthday_needs_agreement: string;
    birthday: string;
    birthday_type: string;
    has_gender?: boolean;
    gender_needs_agreement: boolean;
    gender?: "male" | "female";
  };
};
