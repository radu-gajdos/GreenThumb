import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { AuthLog } from 'src/modules/auth/entities/authLog.entity';
import { VerificationToken } from 'src/modules/auth/entities/verificationToken.entity';
import { RefreshToken } from 'src/modules/auth/entities/refreshToken.entity';
import { TwoFactorCode } from 'src/modules/auth/entities/twoFactorCode.entity';
import { ActiveSession } from 'src/modules/auth/entities/activeSession.entity';
import { Plot } from 'src/modules/plot/entities/plot.entity';

@Entity()
export class User {
    @Expose({ groups: ['user', 'relation'] })
    @PrimaryGeneratedColumn()
    id: number;
    
    @Expose({ groups: ['user', 'relation'] })
    @Column({ nullable: false })
    name: string;
    
    @Expose({ groups: ['user', 'relation'] })
    @Column({ nullable: false, unique: true })
    email: string;
    
    @Expose({ groups: ['user', 'admin'] })
    @Column({ nullable: true, default: null })
    phone: string;
    
    @Expose({ groups: ['admin'] })
    @Column({ type: 'timestamp', nullable: true, default: null })
    lastLogin: Date;
    
    @Expose({ groups: ['admin'] })
    @Column({ type: 'timestamp', nullable: true, default: null })
    emailVerified: Date;
    
    @Expose({ groups: ['user', 'admin'] })
    @Column({ default: true })
    twoFactorEnabled: boolean;
    
    @Exclude()
    @Column({ nullable: true, default: null })
    twoFactorSecret?: string;
    
    @Exclude()
    @Column({ nullable: true, default: null })
    twoFactorRecoveryCodes?: string;
    
    @Expose({ groups: ['user', 'admin'] })
    @Column({ default: 'email' })
    twoFactorType: string;
    
    @Exclude()
    @Column({ nullable: false })
    password: string;
    
    @Expose({ groups: ['admin'] })
    @Column({ type: 'timestamp', nullable: true, default: null })
    passwordChangedAt: Date;
    
    @Expose({ groups: ['admin'] })
    @Column({ default: 0 })
    passwordResetCount: number;
    
    @Expose({ groups: ['admin'] })
    @CreateDateColumn()
    createdAt: Date;
    
    @Expose({ groups: ['admin'] })
    @UpdateDateColumn()
    updatedAt: Date;
    
    @Expose({ groups: ['admin'] })
    @DeleteDateColumn()
    deletedAt?: Date;

    @OneToMany(() => AuthLog, (authLog) => authLog.user)
    authLogs: AuthLog[];

    @OneToMany(() => VerificationToken, (verificationToken) => verificationToken.user)
    verificationTokens: VerificationToken[];

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => TwoFactorCode, (twoFactorCode) => twoFactorCode.user)
    twoFactorCodes: TwoFactorCode[];

    @OneToMany(() => ActiveSession, (activeSession) => activeSession.user)
    activeSessions: ActiveSession[];
    
    // plots of a user
    @Expose({ groups: ['user', 'relation'] })
    @OneToMany(() => Plot, (plot) => plot.owner)
    plots: Plot[];
}
