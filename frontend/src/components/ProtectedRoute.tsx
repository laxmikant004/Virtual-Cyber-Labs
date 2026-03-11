import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function ProtectedRoute({ children }: any) {

  const { authenticated } = useAuth()

  if (!authenticated) {
    return <Navigate to="/" />
  }

  return children
}