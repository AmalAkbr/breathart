
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormMongoDB from "./FormMongoDB";
import { getAuthToken } from "../../utils/apiClient";
import { useUserStore } from "../../store/userStore";

const Protected = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();

  useEffect(() => {
    // Check for existing auth token
    const token = getAuthToken();
    
    // If already logged in, redirect to appropriate page
    if (token && isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [navigate, isLoggedIn]);

  // Listen for storage changes (when logout happens in another tab/window)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "auth_token") {
        if (!e.newValue) {
          // Token was removed, reload to show form
          window.location.reload();
        } else if (e.newValue) {
          // Token was added in another tab, redirect
          navigate("/", { replace: true });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  return <FormMongoDB />;
};

export default Protected;
