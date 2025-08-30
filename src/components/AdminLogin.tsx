import React, { useState } from 'react';
import { Lock, Phone, User, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onPhoneLogin: (phoneNumber: string) => Promise<{ success: boolean; requiresSetup?: boolean; error?: string }>;
  onSetupAccount: (phoneNumber: string, username: string, password: string, name: string) => Promise<boolean>;
  onBack: () => void;
}

const phoneSchema = yup.object({
  phoneNumber: yup.string()
    .required('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
});

const setupSchema = yup.object({
  username: yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  name: yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
});

const loginSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required')
});

export const AdminLogin: React.FC<AdminLoginProps> = ({ 
  onLogin, 
  onPhoneLogin, 
  onSetupAccount, 
  onBack 
}) => {
  const [step, setStep] = useState<'phone' | 'setup' | 'login'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const phoneForm = useForm({
    resolver: yupResolver(phoneSchema),
    defaultValues: { phoneNumber: '' }
  });

  const setupForm = useForm({
    resolver: yupResolver(setupSchema),
    defaultValues: { username: '', password: '', confirmPassword: '', name: '' }
  });

  const loginForm = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  });

  const handlePhoneSubmit = async (data: { phoneNumber: string }) => {
    setIsLoading(true);
    try {
      const result = await onPhoneLogin(data.phoneNumber);
      
      if (result.success) {
        setPhoneNumber(data.phoneNumber);
        if (result.requiresSetup) {
          setStep('setup');
          toast.success('Phone verified! Please set up your account.');
        } else {
          setStep('login');
          toast.success('Phone verified! Please enter your credentials.');
        }
      } else {
        toast.error(result.error || 'Phone verification failed');
      }
    } catch (error) {
      toast.error('An error occurred during phone verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupSubmit = async (data: { username: string; password: string; name: string }) => {
    setIsLoading(true);
    try {
      const success = await onSetupAccount(phoneNumber, data.username, data.password, data.name);
      
      if (success) {
        toast.success('Account setup complete! Welcome to the admin dashboard.');
      } else {
        toast.error('Account setup failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during account setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (data: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const success = await onLogin(data.username, data.password);
      
      if (!success) {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {step === 'phone' && 'Admin Access'}
            {step === 'setup' && 'Account Setup'}
            {step === 'login' && 'Admin Login'}
          </h2>
          <p className="mt-2 text-gray-600">
            {step === 'phone' && 'Enter your registered phone number'}
            {step === 'setup' && 'Complete your account setup'}
            {step === 'login' && 'Sign in to access the admin dashboard'}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-8">
          {step === 'phone' && (
            <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...phoneForm.register('phoneNumber')}
                    type="tel"
                    className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {phoneForm.formState.errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{phoneForm.formState.errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Continue'}
                </button>
              </div>
            </form>
          )}

          {step === 'setup' && (
            <form onSubmit={setupForm.handleSubmit(handleSetupSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  {...setupForm.register('name')}
                  type="text"
                  className="block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your full name"
                />
                {setupForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{setupForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...setupForm.register('username')}
                    type="text"
                    className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Choose a username"
                  />
                </div>
                {setupForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">{setupForm.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...setupForm.register('password')}
                    type="password"
                    className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Create a strong password"
                  />
                </div>
                {setupForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{setupForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...setupForm.register('confirmPassword')}
                    type="password"
                    className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Confirm your password"
                  />
                </div>
                {setupForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{setupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </form>
          )}

          {step === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...loginForm.register('username')}
                    type="text"
                    className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter username"
                  />
                </div>
                {loginForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...loginForm.register('password')}
                    type="password"
                    className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter password"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};