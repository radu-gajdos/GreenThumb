import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GalleryVerticalEnd } from 'lucide-react';
import LoginForm from '../components/login-form';
import TwoStepForm from '../components/twoStep-form';
import { authApi } from '../../../api/auth';
import { LoginFormType } from '../interfaces';

const Login : React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<string>('login'); // login/app/email
  const [form, setForm] = useState<LoginFormType>({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const checkTwoStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.verify2FA({ rememberMe: form.rememberMe, token: code });
      saveCredentials(response.data);
    } catch (err : any) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  const saveCredentials = (data: any) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    navigate('/app/dashboard');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email: form.email, password: form.password, rememberMe: form.rememberMe });
      if (response.data.data.requires2FA) {
        localStorage.setItem('tempToken', response.data.data.tempToken);
        setStep(response.data.data.twoFactorType);
      }else{
        saveCredentials(response.data.data);
      }
    } catch (err : any) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            IMEIOK
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs"> 
            {step === 'login' ? (
              <LoginForm form={form} setForm={setForm} onSubmit={handleSubmit} loading={loading} error={error} />
            ) : (
              <TwoStepForm code={code} setCode={setCode} setStep={setStep} onSubmit={checkTwoStep} loading={loading} error={error} type={step} />
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://ui.shadcn.com/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Login;