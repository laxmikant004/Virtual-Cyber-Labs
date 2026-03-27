import { useState, type FormEvent } from "react"
import API from "../api/axios"
import { useNavigate } from "react-router-dom"

export default function VerifyOTP() {

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")

  const navigate = useNavigate()

  const handleVerify = async (e: FormEvent) => {

    e.preventDefault()

    await API.post("/auth/verify", {
      email,
      otp
    })

    navigate("/")
  }

  return (

    <form onSubmit={handleVerify}>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="OTP"
        onChange={(e) => setOtp(e.target.value)}
      />

      <button>Verify</button>

    </form>
  )
}