import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { authAPI, getAuthToken } from '../../utils/apiClient';
import { validateToken } from '../../utils/validators';
import { toast } from '../../utils/toast';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, setUser, setError, clearError, error } = useUserStore();
  const [verificationToken, setVerificationToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [autoVerifyAttempted, setAutoVerifyAttempted] = useState(false);

  // Resolve email from multiple sources for reliable autofill
  const urlEmail = searchParams.get('email');
  const stateEmail = location.state?.email || '';
  const pendingEmail = sessionStorage.getItem('pendingVerifyEmail') || '';
  const storeEmail = user?.email || '';
  const userEmail = urlEmail || stateEmail || pendingEmail || storeEmail || '';
  const urlToken = searchParams.get('token');

  // Persist resolved email for refresh/revisit autofill
  useEffect(() => {
    if (userEmail) {
      sessionStorage.setItem('pendingVerifyEmail', userEmail);
    }
  }, [userEmail]);

  // Redirect only when we have neither auth nor recoverable verify context
  useEffect(() => {
    if (!getAuthToken() && !userEmail && !urlToken) {
      navigate('/login');
    }
  }, [userEmail, urlToken, navigate]);

  // ===== DEFINE ALL HANDLERS FIRST (before effects that use them) =====
  
  const handleAutoVerify = useCallback(async (tokenToVerify) => {
    console.log('[VERIFY EMAIL] Auto-verifying with token:', tokenToVerify.substring(0, 20) + '...');
    console.log('[VERIFY EMAIL] Email:', userEmail);
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authAPI.verifyEmail(userEmail, tokenToVerify);

      if (response.success) {
        console.log('[VERIFY EMAIL] ✅ Verification successful!');
        sessionStorage.removeItem('pendingVerifyEmail');
        
        // Email verified! Update user in store
        if (response.data?.user) {
          setUser(response.data.user);
          console.log('[VERIFY EMAIL] User state updated:', response.data.user.email);
        }
        
        // Show success toast
        toast.success('✓ Email verified successfully!');

        // Redirect to home after brief delay
        setTimeout(() => {
          console.log('[VERIFY EMAIL] Redirecting to home...');
          navigate('/', { replace: true });
        }, 1500);
      } else {
        const errorMsg = response.message || 'Failed to verify email';
        console.error('[VERIFY EMAIL] ❌ Verification failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Failed to verify email';
      console.error('[VERIFY EMAIL] ❌ Error:', errorMessage, err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [userEmail, setUser, setError, navigate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setValidationError('');
    setIsSubmitting(true);

    const validation = validateToken(verificationToken);
    if (!validation.isValid) {
      setValidationError(validation.error);
      setIsSubmitting(false);
      return;
    }

    await handleAutoVerify(verificationToken);
  }, [verificationToken, handleAutoVerify]);

  const handleResendEmail = useCallback(async () => {
    if (!userEmail) {
      toast.error('Email address not found');
      return;
    }

    console.log('[VERIFY EMAIL] Resending verification to:', userEmail);
    setIsResendingEmail(true);
    setResendMessage('');
    setError(null);

    try {
      const response = await authAPI.resendVerification(userEmail);

      if (response.success) {
        console.log('[VERIFY EMAIL] ✅ Verification email resent');
        setResendMessage('✓ Verification email sent! Check your inbox.');
        toast.success('Verification email sent!');
      } else {
        const errorMsg = response.message || 'Failed to resend verification email';
        console.error('[VERIFY EMAIL] ❌ Resend failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Failed to resend email';
      console.error('[VERIFY EMAIL] ❌ Resend error:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResendingEmail(false);
    }
  }, [userEmail, setError]);

  const handleLogout = useCallback(async () => {
    try {
      sessionStorage.removeItem('pendingVerifyEmail');
      await authAPI.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  }, [navigate]);

  // ===== NOW DEFINE EFFECTS THAT USE THE HANDLERS =====

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Auto-clear validation error after 5 seconds
  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  // Auto-clear resend message after 5 seconds
  useEffect(() => {
    if (resendMessage) {
      const timer = setTimeout(() => {
        setResendMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [resendMessage]);

  // Auto-verify if token is in URL (from email link)
  useEffect(() => {
    if (!urlToken || autoVerifyAttempted) return;
    
    console.log('[VERIFY EMAIL COMPONENT] Token found - urlToken:', urlToken.substring(0, 20) + '...');
    console.log('[VERIFY EMAIL] Starting auto-verify...');
    
    setAutoVerifyAttempted(true);
    handleAutoVerify(urlToken);
  }, [urlToken, autoVerifyAttempted, handleAutoVerify]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black px-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/50">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Email</h1>
            <p className="text-gray-400">Almost there! Verify your email to complete registration</p>
          </div>

          {/* Global Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {resendMessage && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50">
              <p className="text-green-400 text-sm">{resendMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Display */}
            <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">Verification code sent to:</p>
              <p className="text-white font-semibold truncate">{userEmail}</p>
            </div>

            {/* Verification Token Field */}
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="token"
                value={verificationToken}
                onChange={(e) => {
                  setVerificationToken(e.target.value);
                  if (validationError) {
                    setValidationError('');
                  }
                }}
                placeholder="Enter code from email"
                className={`w-full px-4 py-3 rounded-lg bg-gray-700/50 border transition-colors
                  ${
                    validationError
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-gray-600 focus:border-blue-400'
                  }
                  text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                disabled={isSubmitting}
              />
              {validationError && (
                <p className="mt-1 text-sm text-red-400">{validationError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Resend Email Section */}
          <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isResendingEmail}
              className="w-full py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white
                disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
                font-semibold rounded-lg transition-all duration-200"
            >
              {isResendingEmail ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {/* Logout Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Sign out and try with another account
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
}
