import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function ProtectedRoute({ children }: any) {

  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/" />
  }

  return children
}