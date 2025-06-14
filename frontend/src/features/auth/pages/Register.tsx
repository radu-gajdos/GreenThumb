import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GalleryVerticalEnd } from 'lucide-react';
import RegisterForm from '../components/register-form';
import { authApi } from '../../../api/auth';
import { RegisterFormType } from '../interfaces';

/**
 * @component Register
 * @description
 * Renders the registration page which handles:
 * 1) User registration form with validation
 * 2) API submission to backend
 * 3) Success message and redirect to login
 * 4) Error handling for registration issues
 */
const Register: React.FC = () => {
  const navigate = useNavigate();

  /** Global loading indicator for form submissions */
  const [loading, setLoading] = useState<boolean>(false);
  /** Error message to display under the form */
  const [error, setError] = useState<string>('');
  /** Success message after successful registration */
  const [successMessage, setSuccessMessage] = useState<string>('');
  /** Holds the values for the registration form */
  const [form, setForm] = useState<RegisterFormType>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  /**
   * Handler for submitting the registration form.
   * Validates passwords match, then submits to backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Frontend validation
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Prepare payload (exclude confirmPassword as backend doesn't need it)
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      };

      const response = await authApi.register(payload);
      
      // Show success message
      setSuccessMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      // Show the server-provided error message
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show success screen if registration was successful
  if (successMessage) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2 flex flex-col flex-1">
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
            <div className="w-full max-w-xs text-center">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg 
                      className="w-8 h-8 text-green-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-green-600">Registration Successful!</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    {successMessage}
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting to login page in 3 seconds...
                  </p>
                </div>
                
                <a 
                  href="/login" 
                  className="text-sm underline underline-offset-4 hover:text-primary"
                >
                  Go to login page now
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: decorative image for large screens */}
        <div className="relative hidden bg-muted lg:block">
          <img
            src="https://ui.shadcn.com/placeholder.svg"
            alt="Decorative"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    );
  }

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
            <RegisterForm
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Right panel: decorative image for large screens */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://ui.shadcn.com/placeholder.svg"
          alt="Decorative"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Register;