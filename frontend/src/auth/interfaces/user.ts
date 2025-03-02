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
    twoFactorEnabled: boolean;
    twoFactorType: string;
}