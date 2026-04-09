export type UserRole = 'customer' | 'admin';

export interface Usermodel {
  id:        number;
  name:      string;
  email:     string;
  role:      UserRole;
  isLocked?: boolean;
  createdAt?: string;
}

export interface Sessionmodel {
  jti:        string;
  ip:         string;
  userAgent:  string;
  createdAt:  string;
  isCurrent:  boolean;
}

export interface ProfileResponsemodel {
  user:     Usermodel;
  sessions: Sessionmodel[];
}

export interface AdminCustomer extends Usermodel {
  activeSessions: number;
}