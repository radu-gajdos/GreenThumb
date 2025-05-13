import { Button } from "../../../components/ui/button"
import Alert from "../../../components/ui/flowbiteAlert";
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Loader2 } from "lucide-react"
import React from "react"

interface TwoStepFormProps {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  setStep: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string;
  type: string;
}

const TwoStepForm: React.FC<TwoStepFormProps> = ({ code, setCode, setStep, onSubmit, loading, error="", type }) => {
  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Two Step challange</h1>
        <p className="text-balance text-sm text-muted-foreground">
            {
                type === "app" ? "Please enter the code from your authenticator app" :
                type === "email" ? "Please enter the code sent to your email" :
                ""
            }
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="code">Code</Label>
          <Input value={code} id="code" type="texg" placeholder="123456" required onChange={(e) => setCode(e.target.value) } />
        </div>

        {/* Error */}
        {error.trim() !== "" && (
          <Alert type="danger" title="Error!">
            {error}
          </Alert>
        )}

        {/* Submit */}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Loading..." : "Login"}
        </Button>
        <Button variant="outline" className="w-full" type="button" onClick={() => setStep('login')}>
            Back to login
        </Button>
      </div>
    </form>
  )
};

export default TwoStepForm;
