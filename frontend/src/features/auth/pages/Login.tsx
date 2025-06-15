import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GalleryVerticalEnd } from 'lucide-react';
import LoginForm from '../components/login-form';
import TwoStepForm from '../components/twoStep-form';
import { authApi } from '../../../api/auth';
import { LoginFormType } from '../interfaces';

/**
 * @component Login
 * @description
 * Renders the login page which handles:
 * 1) Standard email/password login
 * 2) Conditional two-factor authentication step
 * On success, saves tokens to localStorage and navigates to the dashboard.
 */
const Login: React.FC = () => {
  const navigate = useNavigate();

  /** Global loading indicator for form submissions */
  const [loading, setLoading] = useState<boolean>(false);
  /** 2FA code entered by the user */
  const [code, setCode] = useState<string>('');
  /** Error message to display under the form */
  const [error, setError] = useState<string>('');
  /**
   * Current step in the flow:
   * - `'login'`: show email/password form
   * - otherwise: show 2FA form, where `step` holds the type (e.g. 'app' or 'email')
   */
  const [step, setStep] = useState<string>('login');
  /** Holds the values for the login form */
  const [form, setForm] = useState<LoginFormType>({
    email: '',
    password: '',
    rememberMe: false,
  });

  /**
   * Handler for submitting the 2FA verification form.
   */
  const checkTwoStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify the 2FA token using the temporary token stored earlier
      const response = await authApi.verify2FA({
        rememberMe: form.rememberMe,
        token: code,
      });
      saveCredentials(response.data);
    } catch (err: any) {
      // Show the server-provided error message
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Saves authentication tokens to localStorage and navigates to dashboard.
   * @param data - Object containing accessToken and refreshToken
   */
  const saveCredentials = (data: any) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    navigate('/app/dashboard');
  };

  /**
   * Handler for submitting the initial login form.
   * Switches to 2FA step if required, or completes login if not.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
      });

      const payload = response.data.data;
      if (payload.requires2FA) {
        // Store temporary token for the 2FA verification call
        localStorage.setItem('tempToken', payload.tempToken);
        // Move to the appropriate 2FA UI (e.g., 'app' or 'email')
        setStep(payload.twoFactorType);
      } else {
        // No 2FA needed—complete login
        saveCredentials(payload);
      }
    } catch (err: any) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2 flex flex-col flex-1">
      {/* Left panel: logo + form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/login" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            GreenThumb
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {step === 'login' ? (
              /* Render the email/password login form */
              <LoginForm
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
              />
            ) : (
              /* Render the 2FA verification form */
              <TwoStepForm
                code={code}
                setCode={setCode}
                setStep={setStep}
                onSubmit={checkTwoStep}
                loading={loading}
                error={error}
                type={step}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right panel: decorative image for large screens */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/login.jpg"
          alt="Decorative"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Login;
