import { useState } from "react";
import axios from "axios";
import { Image, Lock, Mail, Loader2, Eye, EyeOff, User } from "lucide-react";

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState(""); // 👤 Added state for Username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Backend minimum validation matching
    if (!isLogin && username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    // const endpoint = isLogin
    //   ? 'http://localhost:5000/api/auth/login'
    //   : 'http://localhost:5000/api/auth/register';

    const API_URL = "https://thumbforge-ai-backend.onrender.com";

    const endpoint = isLogin
      ? `${API_URL}/api/auth/login`
      : `${API_URL}/api/auth/register`;

    // Build payload dynamically based on view status
    const payload = isLogin
      ? { email, password }
      : { username, email, password };

    try {
      const response = await axios.post(endpoint, payload);

      if (isLogin) {
        if (response.data.success && response.data.token) {
          onLoginSuccess(response.data.token);
        }
      } else {
        // Registration success handles redirect to login layout smoothly
        if (response.data.success) {
          setSuccessMsg("Account created successfully! Please sign in.");
          setIsLogin(true); // Take them to sign in
          setUsername("");
        }
      }
    } catch (err) {
      // Extract structured express-validator messages or fallback text safely
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && serverErrors.length > 0) {
        setError(`Validation failed: ${serverErrors[0].path} is invalid.`);
      } else {
        setError(
          err.response?.data?.message ||
            "Authentication failed. Check your data.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm shadow-xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-500/20 mb-3">
            <Image size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            THUMBFORGE AI
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin
              ? "Sign in to forge high-converting thumbnails"
              : "Create your free account to start forging"}
          </p>
        </div>

        {error && (
          <div className="text-sm bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mb-4">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 👤 CONDITIONAL USERNAME FIELD (Visible ONLY during Register signup) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-slate-500"
                  size={18}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="min 3 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-slate-500"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password (min 6 chars)
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-slate-500"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccessMsg("");
              setShowPassword(false);
            }}
            className="text-xs text-indigo-400 hover:underline font-medium"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
