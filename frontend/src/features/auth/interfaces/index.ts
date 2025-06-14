export interface LoginFormType {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterFormType {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
}

export interface RegisterApiPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface TwoFactorFormType {
    token: string;
    rememberMe: boolean;
}

export interface UserType {
    id: number;
    name: string;
    email: string;
    actualEmail: string;
    phone: string | null;
    currencyId: number;
    languageId: number;
    admin: boolean;
    accountType: number;
    avatar: string | null;
    balance: number;
    debtLimit: number;
    active: boolean;
    twoFactorEnabled: boolean;
    twoFactorType: string;
}