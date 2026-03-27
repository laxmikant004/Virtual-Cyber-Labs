import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import API from "../api/axios"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Email and password required")
      return
    }

    try {
      setLoading(true)

      await API.post("/auth/login", {
        identifier: email,
        password
      })

      login()
      toast.success("Authentication successful")
      navigate("/dashboard")
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Authentication failed"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F19] text-slate-200 overflow-hidden relative font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Grid Pattern (Subtle) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA0NFYwSDI0djQ0SDB2MTJoMjRWNjBoMTJWNDRoMjRWMzRMMzYgNDR6IiBmaWxsPSIjRkZGRkZGIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz48L2c+PC9zdmc+')] opacity-20 pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[420px] p-8 sm:p-10 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.5)] sm:rounded-[2rem]">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <ShieldCheck className="w-8 h-8 text-white relative z-10" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Virtual Cyber Labs
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Secure Authentication Portal
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="admin@vcl.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all sm:text-sm"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center pl-1 pr-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all sm:text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 relative group overflow-hidden rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 group-hover:bg-[length:200%_auto] bg-[length:100%_auto] transition-[background-position] duration-500 group-hover:bg-right" />
            
            <div className="relative flex items-center justify-center py-3.5 text-sm font-semibold tracking-wide text-white transition-transform duration-200">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Footer Section */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-white hover:text-indigo-300 transition-colors ml-1 border-b border-transparent hover:border-indigo-300"
            >
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}