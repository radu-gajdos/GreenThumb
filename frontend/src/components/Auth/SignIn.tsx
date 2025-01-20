import React from "react";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import Alert from "../Misc/Alert";
import Loading from "../Misc/Loading";

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
}

const SignIn = () => {
    const { t } = useTranslation();

    const [formData, setFormData] = React.useState<FormData>({
        email: "",
        password: "",
    });

    const [errors, setErrors] = React.useState<FormErrors>({});
    const [apiError, setApiError] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false); // Loading state

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
        setApiError(null); // Reset any previous API error
        setSuccessMessage(null); // Reset any previous success message
        setIsLoading(true); // Show loading spinner

        try {
            await validationSchema.validate(formData, { abortEarly: false });

            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                // Store the token in localStorage or context for future use
                localStorage.setItem("authToken", data.token);
                console.log(localStorage.getItem("authToken"));
                setSuccessMessage(t("signInSuccess"));
            } else if (response.status === 401) {
                setApiError(t("apiError.invalidCredentials"));
            } else {
                const errorMessage = await response.text();
                setApiError(errorMessage || t("apiError.default"));
            }
        } catch (error: any) {
            if (error.name === "ValidationError") {
                // Handle validation errors
                const newErrors: FormErrors = {};
                if (error.inner && Array.isArray(error.inner)) {
                    error.inner.forEach((err: yup.ValidationError) => {
                        if (err.path) newErrors[err.path as keyof FormErrors] = err.message;
                    });
                }
                setErrors(newErrors);
            } else {
                // Handle non-validation errors (e.g., network errors)
                setApiError(t("apiError.default"));
            }
        } finally {
            setIsLoading(false); // Hide loading spinner
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

                    {apiError && (
                        <Alert message={apiError} type="error" mode="popup" onClose={() => setApiError(null)} />
                    )}

                    {successMessage && (
                        <Alert message={successMessage} type="success" mode="popup" onClose={() => setSuccessMessage(null)} />
                    )}

                    {isLoading ? (
                        <Loading message={t("signInLoadingMessage")} size="large" />
                    ) : (
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
                                    name="email"
                                    className={`w-full p-3 text-lg rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"}`}
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
                                    name="password"
                                    className={`w-full p-3 text-lg rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"}`}
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
                    )}

                    <p className="text-center text-sm text-gray-600">
                        {t("dontHaveAccount")} {" "}
                        <a href="/sign-up" className="text-green-600 hover:underline">
                            {t("signUp")}
                        </a>
                    </p>
                </div>
            </div>

            <div
                className="w-full lg:w-1/3 bg-green-50 p-8 min-h-[300px] lg:min-h-screen flex items-center justify-center"
                style={{
                    backgroundImage: `url('/assets/signup-illustration.png')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="max-w-sm mx-auto space-y-8">
                    <h2 className="text-2xl lg:text-2xl font-semibold text-left text-gray-800">
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

export default SignIn;
