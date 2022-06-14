export type AuthType = 'GOOGLE';

export interface User {
  auth_type_enum: AuthType;
  email: string;
  register_date: string;
  username: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
}

export interface DeleteAccountResponse {
  message: string;
  status: string;
  status_code: number;
}
