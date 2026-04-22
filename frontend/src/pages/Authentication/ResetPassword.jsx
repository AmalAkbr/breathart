import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle, Loader } from "lucide-react";
import { useAuthFunctions, useVerifyResetToken } from "../../hooks/useConvexFunctions";
import { toast } from "../../utils/toast";
import { getConvexErrorMessage } from "../../utils/convexError";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const { resetPassword } = useAuthFunctions();
  const verifyToken = useVerifyResetToken();
  
  const [status, setStatus] = useState("loading"); // loading, form, success, error
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing reset token. Please check your email link.");
        return;
      }

      try {
        setStatus("loading");
        const result = await verifyToken({ token });
        if (result.success) {
          setStatus("form");
        } else {
          setStatus("error");
          setMessage(result.message || "Invalid or expired reset token.");
        }
      } catch (err) {
        console.log("[RESET PASSWORD] Verification Error:", err);
        setStatus("error");
        const errorMessage = getConvexErrorMessage(err, "Invalid or expired reset token.");
        setMessage(errorMessage);
      }
    };

    performVerification();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      console.log("[RESET PASSWORD] Submitting new password");

      const response = await resetPassword({
        token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        console.log("[RESET PASSWORD] Success");
        setStatus("success");
        toast.success("Password updated! Please login with your new password.");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } else {
        const msg = response.message || "Failed to reset password";
        setErrors({ form: msg });
        toast.error(msg);
      }
    } catch (err) {
      console.log("[RESET PASSWORD] Raw Error:", err);
      const errorMessage = getConvexErrorMessage(err, "Failed to reset password.");
      setErrors({ form: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verifying Reset Link</h1>
            <p className="text-slate-400">Please wait...</p>
          </div>
        )}

        {/* Form State */}
        {status === "form" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
            <p className="text-slate-400 mb-6">Enter your new password below</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {errors.form && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {errors.form}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  isSubmitting
                    ? "bg-blue-600/50 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Password Reset!</h1>
            <p className="text-slate-400">{message}</p>
            <p className="text-slate-500 text-sm">Redirecting to login...</p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">Reset Failed</h1>
            <p className="text-slate-400">{message}</p>
            <button
              onClick={() => navigate("/auth")}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
