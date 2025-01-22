import * as yup from "yup";

// A factory function to generate the validation schema
export const getSignInValidationSchema = (t: (key: string) => string) =>
    yup.object().shape({
        email: yup
            .string()
            .email(t("validation.invalidEmail"))
            .required(t("validation.emailRequired")),
        password: yup.string().required(t("validation.passwordRequired")),
    });
