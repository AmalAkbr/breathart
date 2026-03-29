import { useState } from 'react';
import {  Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { authAPI } from '../../utils/apiClient';
import { validateForgotPasswordForm, validateResetPasswordForm } from '../../utils/validators';

export default function ForgotPassword() {
  const { setError, error } = useUserStore();

  const [step, setStep] = useState('email'); // 'email' | 'token' | 'password' | 'success'
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // State for each step
  const [emailInput, setEmailInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  // ===== STEP 1: Request Password Reset =====
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);

    const validation = validateForgotPasswordForm(emailInput);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      setError(null);
      const response = await authAPI.forgotPassword(emailInput);

      if (response.success) {
        setUserEmail(emailInput);
        setStep('token');
      } else {
        setError(response.message || 'Failed to request password reset');
      }
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Failed to request password reset';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== STEP 2: Submit Token =====
  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);

    if (!tokenInput.trim()) {
      setValidationErrors({ token: 'Token is required' });
      setIsSubmitting(false);
      return;
    }

    try {
      setError(null);
      // Verify token with backend
      const response = await fetch(`${API_URL}/auth/verify-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput }),
      });

      const data = await response.json();

      if (response.ok) {
        // Move to password entry step
        setStep('password');
      } else {
        setError(data.message || 'Invalid or expired token');
      }
    } catch (err) {
      setError('Error verifying token. Please try again.');
      console.log(err)
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== STEP 3: Reset Password =====
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);

    const validation = validateResetPasswordForm(
      tokenInput,
      passwordData.password,
      passwordData.confirmPassword
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      setError(null);
      const response = await authAPI.resetPassword(
        tokenInput,
        passwordData.password,
        passwordData.confirmPassword
      );

      if (response.success) {
        setStep('success');
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    if (step === 'token') {
      setStep('email');
      setTokenInput('');
    } else if (step === 'password') {
      setStep('token');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-gray-400">
              {step === 'email' && 'Enter your email to receive a reset link'}
              {step === 'token' && 'Check your email and paste the reset token'}
              {step === 'password' && 'Create your new password'}
              {step === 'success' && 'Password reset successful'}
            </p>
          </div>

          {/* Progress Indicator */}
          {step !== 'success' && (
            <div className="mb-8 flex justify-center gap-2">
              <div className={`h-2 w-2 rounded-full transition-colors ${step === 'email' || step === 'token' || step === 'password' ? 'bg-blue-500' : 'bg-gray-700'}`} />
              <div className={`h-2 w-2 rounded-full transition-colors ${step === 'token' || step === 'password' ? 'bg-blue-500' : 'bg-gray-700'}`} />
              <div className={`h-2 w-2 rounded-full transition-colors ${step === 'password' ? 'bg-blue-500' : 'bg-gray-700'}`} />
            </div>
          )}

          {/* Global Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ===== STEP 1: EMAIL ===== */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={emailInput}
                  autoComplete='true'
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-700/50 border transition-colors
                    ${
                      validationErrors.email
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-gray-600 focus:border-blue-400'
                    }
                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={isSubmitting}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                  disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                  text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {/* ===== STEP 2: TOKEN ===== */}
          {step === 'token' && (
            <form onSubmit={handleTokenSubmit} className="space-y-5">
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  We've sent a reset token to <span className="font-semibold text-white">{userEmail}</span>
                </p>
                <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                  Reset Token
                </label>
                <input
                  type="text"
                  id="token"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    if (validationErrors.token) {
                      setValidationErrors(prev => ({ ...prev, token: '' }));
                    }
                  }}
                  placeholder="Paste your reset token from the email"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-700/50 border transition-colors
                    ${
                      validationErrors.token
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-gray-600 focus:border-blue-400'
                    }
                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={isSubmitting}
                />
                {validationErrors.token && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.token}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="flex-1 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white
                    font-semibold rounded-lg transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                    disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                    text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Token'}
                </button>
              </div>
            </form>
          )}

          {/* ===== STEP 3: PASSWORD ===== */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="text-xs text-gray-400 mb-2">
                  Must contain: uppercase, lowercase, number, and 8+ characters
                </div>
                <input
                  type="password"
                  id="password"
                  value={passwordData.password}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, password: e.target.value }));
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-700/50 border transition-colors
                    ${
                      validationErrors.password
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-gray-600 focus:border-blue-400'
                    }
                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={isSubmitting}
                />
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    if (validationErrors.confirmPassword) {
                      setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-700/50 border transition-colors
                    ${
                      validationErrors.confirmPassword
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-gray-600 focus:border-blue-400'
                    }
                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={isSubmitting}
                />
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="flex-1 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white
                    font-semibold rounded-lg transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                    disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                    text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {/* ===== STEP 4: SUCCESS ===== */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h2>
              <p className="text-gray-400 mb-6">Your password has been changed successfully. You can now log in with your new password.</p>

              <Link
                to="/login"
                className="inline-block w-full py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
                  text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Login
              </Link>
            </div>
          )}

          {/* Back to Login Link */}
          {step !== 'success' && (
            <div className="flex gap-3 mt-6">
              <Link
                to="/login"
                className="flex-1 text-center py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white
                  font-semibold rounded-lg transition-all duration-200"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
