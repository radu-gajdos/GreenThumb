import * as yup from "yup";

export const getSignInValidationSchema = (t: (key: string) => string) =>
    yup.object().shape({
        email: yup
            .string()
            .email(t("validation.invalidEmail"))
            .required(t("validation.emailRequired")),
        password: yup.string().required(t("validation.passwordRequired")),
    });

export const getSignUpValidationSchema = (
    t: (key: string, options?: Record<string, any>) => string
) =>
    yup.object().shape({
        username: yup.string().required(t("validation.usernameRequired")),
        email: yup
            .string()
            .email(t("validation.invalidEmail"))
            .required(t("validation.emailRequired")),
        password: yup
            .string()
            .required(t("validation.passwordRequired"))
            .min(8, t("validation.passwordMin")),
        repassword: yup
            .string()
            .required(t("validation.repasswordRequired"))
            .oneOf([yup.ref("password")], t("validation.passwordMatch")),
    });
