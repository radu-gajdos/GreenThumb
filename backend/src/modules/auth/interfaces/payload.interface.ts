export interface PayloadTokenInterface {
    sub: string;
    is2FAAuthenticated: boolean;
    passwordResetCount: number;
};

export interface JwtUser {
    id: string;
    passwordResetCount: number;
    twoFactorEnabled: boolean;
    is2FAAuthenticated: boolean;
}