import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Checkbox } from "../../../components/ui/checkbox"
import { LoginFormType } from "../interfaces"
import { Loader2 } from "lucide-react"
import Alert from "../../../components/ui/flowbiteAlert"
import React from "react"

interface LoginFormProps {
  form: LoginFormType;
  setForm: React.Dispatch<React.SetStateAction<LoginFormType>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ form, setForm, onSubmit, loading, error="" }) => {
  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Username</Label>
          <Input value={form.email} id="email" type="text" placeholder="test123" required onChange={(e) => { setForm(prev => ({ ...prev, email: e.target.value })) }} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input value={form.password} id="password" type="password" placeholder="********" required onChange={(e) => { setForm(prev => ({ ...prev, password: e.target.value })) }} />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" className="border-gray-300 loginCheckbox" checked={form.rememberMe} onCheckedChange={(checked) => { setForm(prev => ({ ...prev, rememberMe: checked as boolean })) }} />
          <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
            Remember me
          </label>
        </div>

        {/* Error */}
        {error.trim() != "" && (
          <Alert type="danger" title="Error!">
            {error}
          </Alert>
        )}

        {/* Submit */}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Loading..." : "Login"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="#" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  )
};

export default LoginForm;
