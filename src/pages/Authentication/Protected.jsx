

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import Form from "./Form";

const Protected = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (!error) {
        setSession(data.session);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/auth", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06060a] text-white">
        <p className="text-sm text-white/70">Checking your session...</p>
      </div>
    );
  }

  if (session) {
    const user = session.user;
    return (
      <div className="min-h-screen bg-[#06060a] text-white flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <p className="text-xl font-semibold">You are already signed in</p>
          <p className="text-sm text-white/60 mt-1">Welcome back! You can go to the site or sign out below.</p>

          <div className="mt-6 grid gap-3 text-sm text-white/80">
            <div>
              <span className="text-white/50">Email:</span> {user.email}
            </div>
            <div className="break-all">
              <span className="text-white/50">User ID:</span> {user.id}
            </div>
            {user.user_metadata?.full_name && (
              <div>
                <span className="text-white/50">Name:</span> {user.user_metadata.full_name}
              </div>
            )}
            {user.user_metadata?.phone && (
              <div>
                <span className="text-white/50">Phone:</span> {user.user_metadata.phone}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="inline-flex items-center justify-center rounded-full bg-white text-black px-4 py-2 text-sm font-semibold transition hover:bg-white/90"
            >
              Go to Home
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-white/40 hover:bg-white/10"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Form />;
};

export default Protected;
