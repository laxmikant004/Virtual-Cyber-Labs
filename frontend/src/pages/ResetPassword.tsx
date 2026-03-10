import { useState, FormEvent } from "react"
import { useParams } from "react-router-dom"
import API from "../api/axios"

export default function ResetPassword() {

  const { token } = useParams()

  const [password, setPassword] = useState("")

  const handleReset = async (e: FormEvent) => {

    e.preventDefault()

    await API.post(`/auth/reset-password/${token}`, {
      password
    })
  }

  return (

    <form onSubmit={handleReset}>

      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button>Reset Password</button>

    </form>
  )
}