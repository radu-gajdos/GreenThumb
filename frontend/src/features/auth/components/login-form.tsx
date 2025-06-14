import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { LoginFormType } from "../interfaces";
import { Loader2 } from "lucide-react";
import Alert from "../../../components/ui/flowbiteAlert";
import React from "react";
import { useTranslation } from "react-i18next";

interface LoginFormProps {
  form: LoginFormType;
  setForm: React.Dispatch<React.SetStateAction<LoginFormType>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ form, setForm, onSubmit, loading, error = "" }) => {
  const { t } = useTranslation();

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t("loginForm.title")}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t("loginForm.subtitle")}
        </p>
      </div>

      {/* Form fields */}
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">{t("loginForm.usernameLabel")}</Label>
          <Input
            value={form.email}
            id="email"
            type="text"
            placeholder={t("loginForm.usernamePlaceholder")}
            required
            onChange={(e) => {
              setForm((prev) => ({ ...prev, email: e.target.value }));
            }}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">{t("loginForm.passwordLabel")}</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {t("loginForm.forgotPassword")}
            </a>
          </div>
          <Input
            value={form.password}
            id="password"
            type="password"
            placeholder={t("loginForm.passwordPlaceholder")}
            required
            onChange={(e) => {
              setForm((prev) => ({ ...prev, password: e.target.value }));
            }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            className="border-gray-300 loginCheckbox"
            checked={form.rememberMe}
            onCheckedChange={(checked) => {
              setForm((prev) => ({
                ...prev,
                rememberMe: checked as boolean,
              }));
            }}
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {t("loginForm.rememberMe")}
          </label>
        </div>

        {/* Error */}
        {error.trim() !== "" && (
          <Alert type="danger" title={t("loginForm.errorTitle")}>
            {error}
          </Alert>
        )}

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? t("loginForm.loading") : t("loginForm.submit")}
        </Button>
      </div>

      <div className="text-center text-sm">
        {t("loginForm.noAccount")}&nbsp;
        <a href="/register" className="underline underline-offset-4">
          {t("loginForm.signUp")}
        </a>
      </div>
    </form>
  );
};

export default LoginForm;
