import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { RegisterFormType } from "../interfaces"
import { Loader2 } from "lucide-react"
import Alert from "../../../components/ui/flowbiteAlert"
import React from "react"

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
  const handleInputChange = (field: keyof RegisterFormType) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Validation helpers
  const isPasswordMatch = form.password === form.confirmPassword;
  const isPasswordValid = form.password.length >= 6;
  const isFormValid = 
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    form.phone.trim() !== '' &&
    isPasswordValid &&
    isPasswordMatch;

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Name Field */}
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            value={form.name} 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            required 
            onChange={handleInputChange('name')}
            disabled={loading}
          />
        </div>

        {/* Email Field */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            value={form.email} 
            id="email" 
            type="email" 
            placeholder="john@example.com" 
            required 
            onChange={handleInputChange('email')}
            disabled={loading}
          />
        </div>

        {/* Phone Field */}
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            value={form.phone} 
            id="phone" 
            type="tel" 
            placeholder="+1234567890" 
            required 
            onChange={handleInputChange('phone')}
            disabled={loading}
          />
        </div>

        {/* Password Field */}
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            value={form.password} 
            id="password" 
            type="password" 
            placeholder="********" 
            required 
            onChange={handleInputChange('password')}
            disabled={loading}
          />
          {form.password.length > 0 && !isPasswordValid && (
            <p className="text-sm text-red-600">
              Password must be at least 6 characters long
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            value={form.confirmPassword} 
            id="confirmPassword" 
            type="password" 
            placeholder="********" 
            required 
            onChange={handleInputChange('confirmPassword')}
            disabled={loading}
          />
          {form.confirmPassword.length > 0 && !isPasswordMatch && (
            <p className="text-sm text-red-600">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error.trim() !== "" && (
          <Alert type="danger" title="Error!">
            {error}
          </Alert>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !isFormValid}
        >
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  );
};

export default RegisterForm;