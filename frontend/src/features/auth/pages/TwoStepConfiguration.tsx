import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Smartphone, Mail, ArrowRight, Check } from "lucide-react";
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from '../../../hooks/useAuth';
import AuthApi from '../api/auth-api';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../components/ui/input-otp';
import React from 'react';

const TwoStepConfigure = () => {
  const [activeMethod, setActiveMethod] = useState<string|null>(null);
  const [appSetupStep, setAppSetupStep] = useState<number>(0);
//   const [loading, setLoading] = useState(false);
  const [qrString, setQrString] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const {user} = useAuth();
  const authApi = new AuthApi();

  useEffect(() => {
    if(user){
        if(user.twoFactorEnabled){
            setActiveMethod(user.twoFactorType);
        }
    }
  }, [user]);
  
  const handleMethodToggle = (method: any) => {
    if (activeMethod === method) {
        if(appSetupStep > 0 && appSetupStep < 3){
            setActiveMethod(null);
            setAppSetupStep(0);
            
        }else{
            authApi.disableTwoStepAuth((response) => {
                setActiveMethod(null);
                setAppSetupStep(0);
            });
        }
    } else if (activeMethod === null) {
      if(method === 'email'){
        authApi.enableEmail((response) => {
            setActiveMethod(method);
        });
      }else{
        authApi.enableApp((response) => {
            setActiveMethod(method);
            setQrString(response.data.data.qrCode);
            setAppSetupStep(1);
        });
      }
      // daca este email, api pentru acticarea metodei pe email
    } else {
      // Show error toast when trying to enable a method while another is active
      toast({
        variant: "destructive",
        title: "Method activation error",
        description: `Please disable ${activeMethod} authentication first before enabling ${method} authentication.`
      });
    }
  };

  const handleNextStep = () => {
    if(appSetupStep === 1){
        setVerificationCode('');
        setError('');
    }
    if(appSetupStep === 2){
        authApi.verify(verificationCode, 
            (response) => {
                setAppSetupStep(prev => prev + 1);
            },
            (error: string) => {
                setError(error);
            },
        );
    }else{
        setAppSetupStep(prev => prev + 1);
    }
  };

  const renderAuthAppContent = () => {
    switch (appSetupStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Scan this QR code with your authentication app to get started.
            </p>
            <div className="flex justify-center">
              <img 
                src={qrString}
                alt="QR Code"
                className="border rounded-lg"
              />
            </div>
            <Button 
              onClick={handleNextStep}
              className="w-full">
              I've scanned the QR code
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Enter the 6-digit code from your authentication app to verify setup.
            </p>
            <div className="flex justify-center flex-col items-center space-y-4">
                <InputOTP 
                        maxLength={6}
                        value={verificationCode}
                        onChange={(value) => setVerificationCode(value)}
                        pattern={REGEXP_ONLY_DIGITS}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <div>
                    <Button onClick={handleNextStep}>
                        Verify code
                    </Button>
                </div>
                {error.trim().length > 0 && (
                    <Alert className='border-red-600 text-center'>
                        <AlertDescription>
                            <span className="text-red-600">
                                {error}
                            </span>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="h-5 w-5" />
            <span>Authentication app successfully configured!</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Choose your preferred 2FA method. You can only have one method active at a time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email 2FA */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Email Authentication</h3>
                <p className="text-sm text-gray-500">
                  Receive verification codes via email
                </p>
              </div>
            </div>
            <Switch checked={activeMethod === 'email'} onCheckedChange={() => handleMethodToggle('email')} />
          </div>

          {/* Authenticator App */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Authenticator App</h3>
                  <p className="text-sm text-gray-500">
                    Use an authentication app like Google Authenticator
                  </p>
                </div>
              </div>
              <Switch
                checked={activeMethod === 'app'}
                onCheckedChange={() => handleMethodToggle('app')}
              />
            </div>
            

            {(activeMethod === 'app' && appSetupStep === 0) && (
                <Alert>
                    <AlertDescription>
                        <span className="text-green-600">
                        Two-factor authentication active. Use your authenticator app for login verification.
                        </span>
                    </AlertDescription>
                </Alert>
            )}
            
            {activeMethod === 'app' && appSetupStep > 0 && (
              <div className="p-4 border rounded-lg">
                {renderAuthAppContent()}
              </div>
            )}
          </div>

          {/* Status Messages */}
          {activeMethod === 'email' && (
            <Alert>
              <AlertDescription>
                <span className="text-green-600">
                  Email authentication is currently active. You will receive codes via email.
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          {!activeMethod && (
            <Alert>
              <AlertDescription>
                <span className="text-yellow-600">
                  No 2FA method is currently active. Enable one of the methods above to secure your account.
                </span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoStepConfigure;