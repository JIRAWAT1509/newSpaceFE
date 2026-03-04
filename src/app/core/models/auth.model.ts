/** Auth API payloads and responses – endpoints centralized in AuthService */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: { id?: string; email?: string; username?: string; displayName?: string };
}

export interface ForgotPasswordPayload {
  /** อีเมล หรือใช้ username + companyId แทน */
  email?: string;
  username?: string;
  companyId?: string;
}
