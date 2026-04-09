export interface RegisterRequestmodel {
  name:     string;
  email:    string;
  password: string;
}

export interface LoginRequestmodel {
  email:    string;
  password: string;
}

export interface LoginResponsemodel {
  message: string;
  user: {
    id:    number;
    name:  string;
    email: string;
    role:  string;
  };
}
export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface ForgotPasswordResponsemodel {
  message: string;
}

export interface GetResetCodeResponsemodel {
  code:      string;
  expiresAt: string;
  message:   string;
}

export interface ValidationErrormodel {
  field:   string;
  message: string;
}

export interface ApiErrormodel {
  error?:  string;
  errors?: ValidationErrormodel[];
}