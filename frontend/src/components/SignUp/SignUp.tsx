import React, { useState } from "react";
import styles from "./SignUp.module.scss";
import { ReactComponent as Circle } from "../../assets/circle.svg";

const SignUp: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
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
                <Circle className={styles.circle} />
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
                            <div className={styles.inputSlot}>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.input}>
                            <div className={styles.inputTitle}>Password</div>
                            <div className={styles.inputSlot}>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
            <div className={styles.ilustrationContainer}>asda</div>
        </div>
    );
};

export default SignUp;
