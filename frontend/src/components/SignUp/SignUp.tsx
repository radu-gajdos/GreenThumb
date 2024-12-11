import React, { useState } from "react";
import styles from "./SignUp.module.scss";
import { ReactComponent as Circle } from "../../assets/circle.svg";

const SignUp: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        repassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Sign-up successful for ${formData.username}`);
    };

    return (
        <div className={styles.main}>
            <div className={styles.formContainer}>
                <div className={styles.formContent}>
                    <div className={styles.formTitle}>Sign Up</div>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.disclosure}>
                            By creating an account, you agree to the Terms of
                            use and Privacy Policy.
                        </div>
                        <div className={styles.input}>
                            <div className={styles.inputTitle}>Username</div>
                            <input
                                className={styles.inputSlot}
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.input}>
                            <div className={styles.inputTitle}>Email</div>
                            <input
                                className={styles.inputSlot}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.input}>
                            <div className={styles.inputTitle}>Password</div>
                            <input
                                className={styles.inputSlot}
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.input}>
                            <div className={styles.inputTitle}>
                                Repeat Password
                            </div>
                            <input
                                className={styles.inputSlot}
                                type="repassword"
                                name="repassword"
                                value={formData.repassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            Sign Up
                        </button>
                    </form>
                    <div className={styles.accountCheck}>Already have an account? Log in</div>
                </div>
            </div>
            <div className={styles.ilustrationContainer}>
                <div className={styles.ilustrationContent}>
                    <div className={styles.ilustrationTitle}>
                        A Platform Designed for You
                    </div>
                    <div className={styles.ilustrationBullets}>
                        <div className={styles.ilustrationBullet}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="9"
                                height="8"
                                viewBox="0 0 9 8"
                                fill="none"
                            >
                                <circle cx="4.5" cy="4" r="4" fill="#3F3D56" />
                            </svg>
                            <div className={styles.ilustrationBulletText}>
                                Customizable Garden Pages
                            </div>
                        </div>
                        <div className={styles.ilustrationBullet}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="9"
                                height="8"
                                viewBox="0 0 9 8"
                                fill="none"
                            >
                                <circle cx="4.5" cy="4" r="4" fill="#3F3D56" />
                            </svg>
                            <div className={styles.ilustrationBulletText}>
                                AI-Powered Assistance
                            </div>
                        </div>
                        <div className={styles.ilustrationBullet}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="9"
                                height="8"
                                viewBox="0 0 9 8"
                                fill="none"
                            >
                                <circle cx="4.5" cy="4" r="4" fill="#3F3D56" />
                            </svg>
                            <div className={styles.ilustrationBulletText}>
                                Community Connection
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
