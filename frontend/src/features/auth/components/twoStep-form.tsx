import { Button } from "../../../components/ui/button";
import Alert from "../../../components/ui/flowbiteAlert";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface TwoStepFormProps {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  setStep: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string;
  type: string; // "email" | "app"
}

const TwoStepForm: React.FC<TwoStepFormProps> = ({
  code,
  setCode,
  setStep,
  onSubmit,
  loading,
  error = "",
  type,
}) => {
  const { t } = useTranslation();

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t("twoStepForm.title")}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {type === "app"
            ? t("twoStepForm.messages.app")
            : type === "email"
            ? t("twoStepForm.messages.email")
            : ""}
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="code">{t("twoStepForm.fields.code")}</Label>
          <Input
            value={code}
            id="code"
            type="text"
            placeholder={t("twoStepForm.placeholders.code")}
            required
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {error.trim() !== "" && (
          <Alert type="danger" title={t("twoStepForm.errorTitle")}>
            {error}
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin mr-2" />}
          {loading ? t("twoStepForm.buttons.loading") : t("twoStepForm.buttons.login")}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={() => setStep("login")}
        >
          {t("twoStepForm.buttons.back")}
        </Button>
      </div>
    </form>
  );
};

export default TwoStepForm;
