import React from "react";
import { useTranslation } from "react-i18next";
import * as yup from "yup";

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    repassword?: string;
}

const SignUp = () => {
    const { t } = useTranslation();

    const [formData, setFormData] = React.useState<FormData>({
        email: "",
        password: "",
    });

    const [errors, setErrors] = React.useState<FormErrors>({});

    const validationSchema = yup.object().shape({
        email: yup
            .string()
            .email(t("validation.invalidEmail"))
            .required(t("validation.emailRequired")),
        password: yup.string().required(t("validation.passwordRequired")),
    });

    const validateField = async (
        name: keyof FormData,
        value: string
    ): Promise<string | undefined> => {
        try {
            await validationSchema.validateAt(name, {
                ...formData,
                [name]: value,
            });
            return undefined;
        } catch (validationError) {
            return (validationError as yup.ValidationError).message;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await validationSchema.validate(formData, { abortEarly: false });
            // alert(t("alertSignUp", { username: formData.username }));
        } catch (validationError) {
            const newErrors: FormErrors = {};
            (validationError as yup.ValidationError).inner.forEach((err: yup.ValidationError) => {
                if (err.path)
                    newErrors[err.path as keyof FormErrors] = err.message;
            });
            setErrors(newErrors);
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        const errorMessage = await validateField(name as keyof FormData, value);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row text-lg">
            <div className="w-full lg:w-2/3 p-4 lg:p-8 bg-white flex items-center justify-center">
                <div className="max-w-md w-full space-y-8">
                    <h1 className="text-4xl lg:text-5xl font-semibold text-center">{t("signIn")}</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-base font-medium">{t("email")}</label>
                                {errors.email && (
                                    <span className="text-sm text-red-500">{errors.email}</span>
                                )}
                            </div>
                            <input
                                type="email"
                                className="w-full p-3 text-lg rounded-lg border"
                                placeholder={t("emailPlaceholder")}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-base font-medium">{t("password")}</label>
                                {errors.password && (
                                    <span className="text-sm text-red-500">{errors.password}</span>
                                )}
                            </div>
                            <input
                                type="password"
                                className="w-full p-3 text-lg rounded-lg border"
                                placeholder={t("passwordPlaceholder")}
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-full text-lg transition-colors"
                        >
                            {t("signIn")}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-600">
                        {t("dontHaveAccount")} <a href="/sign-up" className="text-green-600 hover:underline">{t("signUp")}</a>
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/3 bg-green-50 p-8 min-h-[300px] lg:min-h-screen flex items-center justify-center" style={{
                backgroundImage: `url('/assets/signup-illustration.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className="max-w-sm mx-auto space-y-8">
                    <h2 className="text-2xl lg:text-3xl font-semibold text-center text-gray-800">
                        {t("platformDesigned")}
                    </h2>

                    <div className="space-y-6 text-lg">
                        <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 rounded-full bg-green-600 flex-shrink-0" />
                            <p className="text-gray-700">{t("customizableGarden")}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 rounded-full bg-green-600 flex-shrink-0" />
                            <p className="text-gray-700">{t("aiAssistance")}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 rounded-full bg-green-600 flex-shrink-0" />
                            <p className="text-gray-700">{t("communityConnection")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
    );
};

export default SignUp;
