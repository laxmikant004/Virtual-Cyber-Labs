import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

export default function ForgotPassword() {

  const [email, setEmail] = useState("")

  const handleSubmit = async (e:any) => {
    e.preventDefault()

    try {

      await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      )

      toast.success("Reset link sent to email")

    } catch (err:any) {

      toast.error(
        err?.response?.data?.message || "Error sending email"
      )

    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-900">

      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96">

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded bg-gray-700 text-white outline-none"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
          >
            Send Reset Link
          </button>

        </form>

      </div>

    </div>

  )
}