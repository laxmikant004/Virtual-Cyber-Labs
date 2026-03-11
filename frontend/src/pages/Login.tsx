import { useState } from "react"

import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"

import { useAuth } from "../contexts/AuthContext"
import API from "../api/axios"
import InputField from "../components/InputField"

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

      toast.success("Login successful")

      navigate("/dashboard")

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message || "Login failed"
      )

    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-700">

      <div className="bg-white shadow-2xl rounded-2xl p-8 w-96">

        <div className="text-center mb-6">

          <h1 className="text-2xl font-bold text-gray-800">
            Virtual Cyber Labs
          </h1>

          <p className="text-gray-500 text-sm">
            Secure Login Portal
          </p>

        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          <InputField
            placeholder="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="text-sm text-center mt-5 space-y-2">

          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:underline block"
          >
            Forgot Password?
          </Link>

          <Link
            to="/register"
            className="text-indigo-600 hover:underline block"
          >
            Create Account
          </Link>

        </div>

      </div>

    </div>
  )
}