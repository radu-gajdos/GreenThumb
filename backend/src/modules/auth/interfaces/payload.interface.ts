export interface PayloadTokenInterface {
    sub: number;
    is2FAAuthenticated: boolean;
    passwordResetCount: number;
};

export interface JwtUser {
    id: number;
    passwordResetCount: number;
    twoFactorEnabled: boolean;
    is2FAAuthenticated: boolean;
}