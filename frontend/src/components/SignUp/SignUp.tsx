import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SignUp.module.scss";
import { ReactComponent as Circle } from "../../assets/circle.svg";

const SignUp: React.FC = () => {
    const { t, i18n } = useTranslation(); // Use the useTranslation hook
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
        alert(t("alertSignUp", { username: formData.username })); // Use translation for the alert message
    };

    const changeLanguage = (lng: string) => {
        console.log(lng);
        i18n.changeLanguage(lng); // Change the language dynamically
    };

    return (
        <div className={styles.main}>
            <div className={styles.formContainer}>
                <div className={styles.formContent}>
                    <div className={styles.formTitle}>{t("signUpTitle")}</div>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.disclosure}>
                            {t("termsAndPrivacy")}
                        </div>
                        <div className={styles.input}>
                            <div className={styles.inputTitle}>
                                {t("username")}
                            </div>
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
                            <div className={styles.inputTitle}>
                                {t("email")}
                            </div>
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
                            <div className={styles.inputTitle}>
                                {t("password")}
                            </div>
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
                                {t("repeatPassword")}
                            </div>
                            <input
                                className={styles.inputSlot}
                                type="password" // Correct type for a password field
                                name="repassword"
                                value={formData.repassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            {t("signUp")}
                        </button>
                    </form>
                    <div className={styles.accountCheck}>
                        {t("alreadyHaveAccount")}
                    </div>
                </div>
            </div>
            <div className={styles.ilustrationContainer}>
                <div className={styles.ilustrationContent}>
                    <div className={styles.ilustrationTitle}>
                        {t("platformDesigned")}
                    </div>
                    <div className={styles.ilustrationBullets}>
                        <div className={styles.ilustrationBullet}>
                            <Circle />
                            <div className={styles.ilustrationBulletText}>
                                {t("customizableGarden")}
                            </div>
                        </div>
                        <div className={styles.ilustrationBullet}>
                            <Circle />
                            <div className={styles.ilustrationBulletText}>
                                {t("aiAssistance")}
                            </div>
                        </div>
                        <div className={styles.ilustrationBullet}>
                            <Circle />
                            <div className={styles.ilustrationBulletText}>
                                {t("communityConnection")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
