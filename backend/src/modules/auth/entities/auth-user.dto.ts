export interface AuthUserDto {
    id: number;
    twoFactorEnabled: boolean;
    passwordChangedAt: Date|null;
    is2FAAuthenticated: boolean;
    companyId: string;
    permissions: string[];
}