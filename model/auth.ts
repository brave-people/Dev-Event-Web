export type AuthType = 'GOOGLE';

export interface User {
  auth_type_enum: AuthType;
  email: string;
  register_date: string;
  username: string;
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
