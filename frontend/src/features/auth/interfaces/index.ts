export interface LoginFormType {
    email: string;
    password: string;
    rememberMe: boolean;
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