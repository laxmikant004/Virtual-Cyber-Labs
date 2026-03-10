import { useState, FormEvent } from "react"
import API from "../api/axios"

export default function ForgotPassword() {

  const [email, setEmail] = useState("")

  const handleSubmit = async (e: FormEvent) => {

    e.preventDefault()

    await API.post("/auth/forgot-password", {
      email
    })

    alert("Reset link sent")
  }

  return (

    <form onSubmit={handleSubmit}>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button>Send Reset Link</button>

    </form>
  )
}