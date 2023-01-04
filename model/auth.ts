export type AuthType = 'GOOGLE';

export interface User {
  auth_type_enum: AuthType;
  email: string;
  register_date: string;
  username: string;
  profile_image_link: string;
}

export interface DeleteAccountResponse {
  message: string;
  status: string;
  status_code: number;
}

export interface TokenProp {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  access_token_expired_at: Date;
  refresh_token: string;
  refresh_token_expired_at: Date;
}

export interface AuthProp {
  password: string;
  user_id: string;
}

export interface SignUpProps extends AuthProp {
  name: string;
  email: string;
}

export interface SignUpResponse {
  status_code: number;
  status: string;
  message: string;
}
