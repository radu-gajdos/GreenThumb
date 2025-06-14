import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { RegisterFormType } from "../interfaces";
import { Loader2 } from "lucide-react";
import Alert from "../../../components/ui/flowbiteAlert";
import React from "react";
import { useTranslation } from "react-i18next";

interface RegisterFormProps {
  form: RegisterFormType;
  setForm: React.Dispatch<React.SetStateAction<RegisterFormType>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  form,
  setForm,
  onSubmit,
  loading,
  error = ""
}) => {
  const { t } = useTranslation();

  const handleInputChange = (field: keyof RegisterFormType) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const isPasswordMatch = form.password === form.confirmPassword;
  const isPasswordValid = form.password.length >= 6;
  const isFormValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.phone.trim() !== "" &&
    isPasswordValid &&
    isPasswordMatch;

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t("registerForm.title")}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t("registerForm.subtitle")}
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">{t("registerForm.nameLabel")}</Label>
          <Input
            value={form.name}
            id="name"
            type="text"
            placeholder={t("registerForm.namePlaceholder")}
            required
            onChange={handleInputChange("name")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">{t("registerForm.emailLabel")}</Label>
          <Input
            value={form.email}
            id="email"
            type="email"
            placeholder={t("registerForm.emailPlaceholder")}
            required
            onChange={handleInputChange("email")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">{t("registerForm.phoneLabel")}</Label>
          <Input
            value={form.phone}
            id="phone"
            type="tel"
            placeholder={t("registerForm.phonePlaceholder")}
            required
            onChange={handleInputChange("phone")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">{t("registerForm.passwordLabel")}</Label>
          <Input
            value={form.password}
            id="password"
            type="password"
            placeholder={t("registerForm.passwordPlaceholder")}
            required
            onChange={handleInputChange("password")}
            disabled={loading}
          />
          {form.password.length > 0 && !isPasswordValid && (
            <p className="text-sm text-red-600">{t("registerForm.passwordTooShort")}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">{t("registerForm.confirmPasswordLabel")}</Label>
          <Input
            value={form.confirmPassword}
            id="confirmPassword"
            type="password"
            placeholder={t("registerForm.confirmPasswordPlaceholder")}
            required
            onChange={handleInputChange("confirmPassword")}
            disabled={loading}
          />
          {form.confirmPassword.length > 0 && !isPasswordMatch && (
            <p className="text-sm text-red-600">{t("registerForm.passwordMismatch")}</p>
          )}
        </div>

        {error.trim() !== "" && (
          <Alert type="danger" title={t("registerForm.errorTitle")}>
            {error}
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={loading || !isFormValid}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? t("registerForm.loading") : t("registerForm.submit")}
        </Button>
      </div>

      <div className="text-center text-sm">
        {t("registerForm.hasAccount")}{" "}
        <a href="/login" className="underline underline-offset-4">
          {t("registerForm.signIn")}
        </a>
      </div>
    </form>
  );
};

export default RegisterForm;
