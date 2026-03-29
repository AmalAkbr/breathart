import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { authAPI, setAuthToken } from "../../utils/apiClient";
import { validateLoginForm } from "../../utils/validators";
import { toast } from "../../utils/toast";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setLoading, setError, clearError, error } = useUserStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Check for ?admin=true in URL
  useEffect(() => {
    const adminParam = searchParams.get("admin");
    if (adminParam === "true") {
      setIsAdminMode(true);
    }
  }, [searchParams]);

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
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
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
    const validation = validateLoginForm(formData.email, formData.password);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call backend
      const response = await authAPI.login(formData.email, formData.password);
      console.log("[LOGIN] Response received:", response);
      
      if (response.success) {
        // Check role matches mode
        const userRole = response.data.user.role;
        const isUserAdmin = userRole === "admin";
        const userIsAdmin = response.data.user.isAdmin === true;

        console.log("[LOGIN] User role:", userRole, "isAdmin flag:", userIsAdmin);

        // ADMIN TRYING TO LOGIN AS REGULAR USER - BLOCK
        if (!isAdminMode && isUserAdmin && userIsAdmin) {
          console.log("[LOGIN] 🔐 BLOCKED: Admin account cannot login as regular user");
          setError("Your account is not permitted to use as user. Please use admin panel.");
          toast.error("Admin accounts cannot login as regular users");
          setIsSubmitting(false);
          setLoading(false);
          return;
        }

        // REGULAR USER TRYING TO LOGIN TO ADMIN - BLOCK
        if (isAdminMode && !isUserAdmin) {
          setError("This account does not have admin privileges");
          toast.error("Admin account required");
          setIsSubmitting(false);
          setLoading(false);
          return;
        }

        if (!isAdminMode && isUserAdmin) {
          console.log("[LOGIN] 🔐 Admin account detected - use /admin to login");
        }

        // Store token
        setAuthToken(response.data.token);
        console.log("[LOGIN] Token stored");

        // Store user in Zustand
        const userData = response.data.user;
        console.log("[LOGIN] Setting user in store:", userData.email, "Role:", userData.role);
        setUser(userData);

        // Show success toast
        const accountType = isUserAdmin ? "Admin" : "User";
        toast.success(`✓ ${accountType} login successful!`);

        // Set loading to false before navigation
        setLoading(false);

        // Navigate based on role and email verification
        if (isUserAdmin) {
          console.log("[LOGIN] 🎯 Navigating to /admin");
          navigate("/admin", { replace: true });
        } else {
          console.log("[LOGIN] 🎯 Navigating to /");
          // Redirect to home (/) for both verified and unverified users
          // Email verification will prompt from home page or user profile
          navigate("/", { replace: true });
        }
      } else {
        setError(response.message || "Login failed");
        toast.error(response.message || "Login failed");
      }
    } catch (err) {
      const errorMessage =
        err.data?.message || err.message || "Login failed. Please try again.";

      console.error("[LOGIN] Error:", errorMessage);

      // Check if error is about email verification
      if (
        errorMessage.toLowerCase().includes("verify") &&
        errorMessage.toLowerCase().includes("email")
      ) {
        setError(errorMessage);
        toast.warning(errorMessage);
        // Store email for potential verify page redirect
        sessionStorage.setItem("pendingVerifyEmail", formData.email);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black px-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">
                {isAdminMode ? "🔐 Admin Login" : "Welcome Back"}
              </h1>
              {/* Admin Toggle */}
              <button
                type="button"
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isAdminMode
                    ? "bg-red-500/20 text-red-300 border border-red-500/50"
                    : "bg-gray-700/50 text-gray-400 border border-gray-600"
                }`}
                title="Toggle admin mode"
              >
                {isAdminMode ? "Admin" : "User"}
              </button>
            </div>
            <p className="text-gray-400">
              {isAdminMode
                ? "Sign in to admin panel"
                : "Sign in to your account"}
            </p>
          </div>

          {/* Global Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm mb-3">{error}</p>
              {error.toLowerCase().includes("verify") &&
                error.toLowerCase().includes("email") && (
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(formData.email)}`}
                    className="inline-block text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    Go to verify email →
                  </Link>
                )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
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
                autoComplete="true"
                onChange={handleInputChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg bg-gray-700/50 border transition-colors
                  ${
                    validationErrors.email
                      ? "border-red-500 focus:border-red-400"
                      : "border-gray-600 focus:border-blue-400"
                  }
                  text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                disabled={isSubmitting}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                <span className="flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  autoComplete="current-password"
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-10 rounded-lg bg-gray-700/50 border transition-colors
                    ${
                      validationErrors.password
                        ? "border-red-500 focus:border-red-400"
                        : "border-gray-600 focus:border-blue-400"
                    }
                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 
                disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        {/* <p className="mt-6 text-center text-gray-500 text-xs">
          💡 Tip: Click the User/Admin button to toggle admin mode before
          logging in
        </p>
        <p className="mt-2 text-center text-gray-500 text-xs">
          Or use URL:{" "}
          <code className="bg-gray-900/50 px-2 py-1 rounded text-gray-400">
            /login?admin=true
          </code>
        </p> */}
      </div>
    </div>
  );
}
