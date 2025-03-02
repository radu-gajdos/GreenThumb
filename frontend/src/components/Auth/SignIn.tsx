import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Misc/Alert";
import Loading from "../../components/Misc/Loading";
import { useForm } from "../../hooks/useForm";
import { getSignInValidationSchema } from "../../validations/authSchemas";
import { authApi } from "../../auth/api/auth";
import { Checkbox } from "../../ui/components/Checkbox";

const SignIn = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Generate the validation schema using the factory function
    const signInValidationSchema = getSignInValidationSchema(t);

    const {
        formData,
        setFormData,
        errors,
        handleChange,
        validateForm,
    } = useForm({ email: "", password: "", rememberMe: false }, signInValidationSchema);

    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [step, setStep] = useState<string>('login'); // login/app/email
    const [code, setCode] = useState<string>("");

    // Direct state update for Checkbox component
    const handleCheckboxChange = (checked: boolean | "indeterminate") => {
        setFormData({
            ...formData,
            rememberMe: checked === true
        });
    };

    const saveCredentials = (data: any) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        navigate('/app/dashboard');
    };

    const checkTwoStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setApiError(null);

        try {
            const response = await authApi.verify2FA({ 
                rememberMe: formData.rememberMe || false, 
                token: code 
            });
            saveCredentials(response.data);
        } catch (error: any) {
            setApiError(error.response?.data?.message || t("apiError.default"));
        } finally {
            setIsLoading(false);
        }
    };

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
            console.log("Form data before login:", formData);
            const response = await authApi.login({ 
                email: formData.email, 
                password: formData.password, 
                rememberMe: formData.rememberMe || false
            });
            
            if (response.data.data.requires2FA) {
                localStorage.setItem('tempToken', response.data.data.tempToken);
                setStep(response.data.data.twoFactorType);
            } else {
                saveCredentials(response.data.data);
            }
        } catch (error: any) {
            setApiError(error.response?.data?.message || t("apiError.default"));
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
                    ) : step === 'login' ? (
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

                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="rememberMe" 
                                    checked={!!formData.rememberMe} 
                                    onCheckedChange={handleCheckboxChange}
                                />
                                <label 
                                    htmlFor="rememberMe" 
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {t("rememberMe")}
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-full text-lg transition-colors"
                            >
                                {t("signIn")}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={checkTwoStep} className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-base font-medium">{t("verificationCode")}</label>
                                    {errors.code && (
                                        <span className="text-sm text-red-500">{errors.code}</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    name="code"
                                    className="w-full p-3 text-lg rounded-lg border border-gray-300"
                                    placeholder={t("enterVerificationCode")}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-full text-lg transition-colors"
                            >
                                {t("verify")}
                            </button>
                            <button
                                type="button"
                                className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full text-lg transition-colors"
                                onClick={() => setStep('login')}
                            >
                                {t("back")}
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