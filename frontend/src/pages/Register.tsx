import { useState } from "react"
import type { FormEvent } from "react"

import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"

import API from "../api/axios"
import InputField from "../components/InputField"

export default function Register() {

  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: FormEvent) => {

    e.preventDefault()

    if (!username || !email || !password) {
      toast.error("All fields are required")
      return
    }

    try {

      setLoading(true)

      await API.post("/auth/register", {
        username,
        email,
        password
      })

      toast.success("OTP sent to your email")

      navigate("/verify", { state: { email } })

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message || "Registration failed"
      )

    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-lg rounded-xl p-8 w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">

          <InputField
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

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
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <div className="text-sm text-center mt-4">

          Already have an account?{" "}
          <Link
            to="/"
            className="text-blue-600 hover:underline"
          >
            Login
          </Link>

        </div>

      </div>

    </div>
  )
}