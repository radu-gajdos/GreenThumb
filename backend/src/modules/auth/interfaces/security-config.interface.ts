export interface SecurityConfig {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      preventPasswordReuse: number; // number of previous passwords to check
    };

    lockout: {
      maxAttempts: number;
      lockoutDuration: number; // in minutes
      attemptWindow: number; // in minutes
    };

    session: {
      accessTokenTTL: number; // in minutes
      refreshTokenTTL: number; // in days
      maxActiveSessions: number;
      rememberMeDuration: number; // in days
    };

    twoFactor: {
      issuer: string;
      backupCodesCount: number;
      emailCodeExpiry: number; // in minutes
    };
  }
