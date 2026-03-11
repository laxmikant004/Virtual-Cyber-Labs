import { useState, type FormEvent } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import API from "../api/axios"

export default function ResetPassword() {

  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")

  const handleReset = async (e: FormEvent) => {

    e.preventDefault()

    try {

      await API.post(`/auth/reset-password/${token}`, {
        password
      })

      toast.success("Password reset successful")

      setTimeout(() => {
        navigate("/login")
      }, 2000)

    } catch (err:any) {

      toast.error(
        err?.response?.data?.message || "Reset failed"
      )

    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-900">

      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96">

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Set New Password
        </h2>

        <form onSubmit={handleReset} className="space-y-4">

          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 rounded bg-gray-700 text-white outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded"
          >
            Reset Password
          </button>

        </form>

      </div>

    </div>
  )
}