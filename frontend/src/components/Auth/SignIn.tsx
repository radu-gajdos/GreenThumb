import React from "react";
import { useTranslation } from "react-i18next";
import Alert from "../Misc/Alert";
import Loading from "../Misc/Loading";
import { useForm } from "../../hooks/useForm";
import { getSignInValidationSchema } from "../../validations/authSchemas";
import { login } from "../../api/auth";

const SignIn = () => {
    const { t } = useTranslation();

    // Generate the validation schema using the factory function
    const signInValidationSchema = getSignInValidationSchema(t);

    const {
        formData,
        errors,
        handleChange,
        validateForm,
    } = useForm({ email: "", password: "" }, signInValidationSchema);

    const [apiError, setApiError] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        const isValid = await validateForm();
        if (!isValid) {
            setIsLoading(false);
            return;
        }

        try {
            const data = await login(formData);
            localStorage.setItem("authToken", data.token);
            setSuccessMessage(t("signInSuccess"));
        } catch (error: any) {
            setApiError(error.message || t("apiError.default"));
        } finally {
            setIsLoading(false);
        }
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
                        {t("dontHaveAccount")}{" "}
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
