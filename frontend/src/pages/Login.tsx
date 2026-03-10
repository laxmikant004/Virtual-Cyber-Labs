import { useState } from "react"

import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"

import API from "../api/axios"
import InputField from "../components/InputField"

export default function Login() {

  const navigate = useNavigate()

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

      const res = await API.post("/auth/login", {
        email,
        password
      })

      localStorage.setItem("token", res.data.token)

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

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-lg rounded-xl p-8 w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <InputField
            placeholder="Email"
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="text-sm text-center mt-4 space-y-2">

          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline block"
          >
            Forgot Password?
          </Link>

          <Link
            to="/register"
            className="text-blue-600 hover:underline block"
          >
            Create Account
          </Link>

        </div>

      </div>

    </div>
  )
}