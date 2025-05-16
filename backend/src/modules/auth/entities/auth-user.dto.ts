export interface AuthUserDto {
    id: string;
    twoFactorEnabled: boolean;
    passwordChangedAt: Date|null;
    is2FAAuthenticated: boolean;
    companyId: string;
    permissions: string[];
}