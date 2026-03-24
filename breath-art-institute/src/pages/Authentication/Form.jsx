import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";

const Form = ({ onClose }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent scroll
  // useEffect(() => {
  //   if (isOpen) {
  //     const originalStyle = window.getComputedStyle(document.body).overflow;
  //     document.body.style.overflow = "hidden";
  //     return () => {
  //       document.body.style.overflow = originalStyle;
  //     };
  //   }
  // }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Clear form values when switching between login/register
  useEffect(() => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  }, [isLogin]);

  const persistSession = (session) => {
    if (!session) return;
    const { access_token, refresh_token } = session;
    if (access_token) {
      localStorage.setItem("sb-access-token", access_token);
      sessionStorage.setItem("sb-access-token", access_token);
      document.cookie = `sb-access-token=${access_token}; path=/; max-age=604800`;
    }
    if (refresh_token) {
      localStorage.setItem("sb-refresh-token", refresh_token);
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.email) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        nextErrors.name = "Name is required";
      }
      if (!formData.confirmPassword) {
        nextErrors.confirmPassword = "Confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { email, password } = formData;
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setErrors({ form: error.message });
          return;
        }
        persistSession(data.session);
        alert("Login successful!");
        onClose && onClose();
        navigate("/");
      } else {
        const { name, email, password } = formData;
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) {
          setErrors({ form: error.message });
          return;
        }
        if (data.session) {
          persistSession(data.session);
          await supabase.auth.updateUser({
            email,
            data: { name },
          });
        }
        alert("Registration successful! Please check your email to verify.");
        setIsLogin(true);
      }

      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };
  console.log(errors)

  return (
    <AnimatePresence>
      <>
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="relative top-25 left-1/2 -translate-x-1/2  w-[92vw] max-w-md bg-[#0d1b2e] border border-white/10 rounded-3xl shadow-2xl p-6 mb-52 mt-10"
        >
          {/* Header */}
          <div className="flex justify-between  items-center mb-6">
            <h2 className="text-white text-xl font-bold text-center w-full ">
              {isLogin ? "Login" : "Register"}
            </h2>
          </div>

          {/* Toggle */}

          <div className="relative flex mb-6 bg-white/5 rounded-xl p-1 overflow-hidden">
            {/* Sliding background */}
            <motion.div
              layout
              transition={{ type: "tween", stiffness: 300, damping: 30 }}
              className="absolute top-1 bottom-1 w-1/2 rounded-lg bg-white"
              style={{
                left: isLogin ? "4px" : "50%",
                right: isLogin ? "50%" : "4px",
              }}
            />

            {/* Login */}
            <button
              onClick={() => setIsLogin(true)}
              className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                isLogin ? "text-black" : "text-white"
              }`}
            >
              Login
            </button>

            {/* Register */}
            <button
              onClick={() => setIsLogin(false)}
              className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isLogin ? "text-black" : "text-white"
              }`}
            >
              Register
            </button>
          </div>
          {errors.form && (
            <p className="text-red-400 text-sm mb-4">{errors.form}</p>
          )}
          {/* Form */}
          <motion.form layout onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {/* LOGIN FORM */}
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Email */}
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}

                  {/* Password */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {errors.password && (
                      <p className="text-red-400 text-sm">{errors.password}</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* REGISTER FORM */
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Name */}
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400"
                  />{" "}
                  {errors.name && (
                    <p className="text-red-400 text-sm">{errors.name}</p>
                  )}
                  {/* Email */}
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400"
                  />{" "}
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}
                  {/* Password */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400"
                    />{" "}
                    {errors.password && (
                      <p className="text-red-400 text-sm">{errors.password}</p>
                    )}
                  </div>
                  {/* Confirm Password */}
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3 text-slate-400 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>{" "}
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              layout
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "Please wait..." : isLogin ? "Login" : "Create Account"}
            </motion.button>
          </motion.form>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default Form;
