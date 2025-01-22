import React from "react";
import { useTranslation } from "react-i18next";
import Alert from "../Misc/Alert"; // Alert component
import Loading from "../Misc/Loading"; // Loading component
import { useForm } from "../../hooks/useForm";
import { getSignUpValidationSchema } from "../../validations/authSchemas";
import { register } from "../../api/auth"; // New function for registration

const SignUp = () => {
    const { t } = useTranslation();

    // Generate the validation schema using the factory function
    const validationSchema = getSignUpValidationSchema(t);

    const {
        formData,
        errors,
        handleChange,
        validateForm,
        setFormData,
        setErrors,
    } = useForm(
        { username: "", email: "", password: "", repassword: "" },
        validationSchema
    );

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
            const requestData = {
                fullName: formData.username,
                email: formData.email,
                password: formData.password,
                phoneNumber: "", // Optional field
            };

            await register(requestData);

            setSuccessMessage(t("alertSignUp", { username: formData.username }));
            setFormData({ username: "", email: "", password: "", repassword: "" });
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
                    <h1 className="text-4xl lg:text-5xl font-semibold text-center">{t("signUpTitle")}</h1>

                    {apiError && (
                        <Alert message={apiError} type="error" mode="popup" onClose={() => setApiError(null)} />
                    )}

                    {successMessage && (
                        <Alert message={successMessage} type="success" mode="popup" onClose={() => setSuccessMessage(null)} />
                    )}

                    {isLoading ? (
                        <Loading message={t("accountCreationLoadingMessage")} size="large" />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-base font-medium">{t("username")}</label>
                                    {errors.username && (
                                        <span className="text-sm text-red-500">{errors.username}</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    className={`w-full p-3 text-lg rounded-lg border ${errors.username ? "border-red-500" : "border-gray-300"}`}
                                    placeholder={t("usernamePlaceholder")}
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>

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

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-base font-medium">{t("repeatPassword")}</label>
                                    {errors.repassword && (
                                        <span className="text-sm text-red-500">{errors.repassword}</span>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    name="repassword"
                                    className={`w-full p-3 text-lg rounded-lg border ${errors.repassword ? "border-red-500" : "border-gray-300"}`}
                                    placeholder={t("repeatPasswordPlaceholder")}
                                    value={formData.repassword}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-full text-lg transition-colors"
                            >
                                {t("signUp")}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-base text-gray-600">
                        {t("alreadyHaveAccount")} <a href="/sign-in" className="text-green-600 hover:underline">{t("signIn")}</a>
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

                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 rounded-full bg-green-600 flex-shrink-0"></div>
                            <p className="text-gray-700">{t("customizableGarden")}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 rounded-full bg-green-600 flex-shrink-0"></div>
                            <p className="text-gray-700">{t("aiAssistance")}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 rounded-full bg-green-600 flex-shrink-0"></div>
                            <p className="text-gray-700">{t("communityConnection")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
