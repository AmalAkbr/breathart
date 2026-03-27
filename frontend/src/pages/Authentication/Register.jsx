import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { authAPI, setAuthToken } from '../../utils/apiClient';
import { validateRegisterForm } from '../../utils/validators';
import { toast } from '../../utils/toast';

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setLoading, setError, clearError, error } = useUserStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Auto-clear validation errors after 5 seconds
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      const timer = setTimeout(() => {
        setValidationErrors({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [validationErrors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);

    // Frontend validation
    const validation = validateRegisterForm(
      formData.fullName,
      formData.email,
      formData.password,
      formData.confirmPassword
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call backend
      const response = await authAPI.signup(
        formData.fullName,
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      if (response.success) {
        const registeredEmail = response?.data?.user?.email || formData.email;

        // Store token
        setAuthToken(response.data.token);

        // Store user in Zustand
        setUser(response.data.user);

        // Keep pending email available for verify-email page autofill
        sessionStorage.setItem('pendingVerifyEmail', registeredEmail);

        // Show success toast
        toast.success('✓ Registration successful! Verify your email.');

        // Go directly to verify-email with prefilled email
        navigate(`/verify-email?email=${encodeURIComponent(registeredEmail)}`, {
          replace: true,
          state: { email: registeredEmail },
        });
      } else {
        setError(response.message || 'Registration failed');
        toast.error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Registration failed. Please try again.';
      if (/valid email|email/i.test(errorMessage)) {
        setValidationErrors((prev) => ({
          ...prev,
          email: 'Please provide a valid email',
        }));
      }
      console.error('[REGISTER] Error:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join us and start learning</p>
          </div>

          {/* Global Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <User size={16} />
                  Full Name
                </span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-lg bg-gray-700/50 border transition-colors
                  ${
                    validationErrors.fullName
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-gray-600 focus:border-blue-400'
                  }
                  text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                disabled={isSubmitting}
              />
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Mail size={16} />
                  Email Address
                </span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </span>
              </label>
              <div className="text-xs text-gray-400 mb-2">
                Must contain: uppercase, lowercase, number, and 8+ characters
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Lock size={16} />
                  Confirm Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-10 rounded-lg bg-gray-700/50 border transition-colors
                    ${
                      validationErrors.confirmPassword
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-gray-600 focus:border-blue-400'
                    }
                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Sign In Link */}
          <p className="text-center text-gray-400 mb-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>

          {/* Admin Login Link */}
          <p className="text-center text-gray-500 text-sm">
            Admin?{' '}
            <Link to="/login?admin=true" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
              Login here
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          By signing up, you agree to our terms and conditions
        </p>
      </div>
    </div>
  );
}
