import { createContext, useContext, useState, type ReactNode } from "react"

interface AuthContextType {
  authenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [authenticated, setAuthenticated] = useState(false)

  const login = () => setAuthenticated(true)

  const logout = () => setAuthenticated(false)

  return (
    <AuthContext.Provider value={{ authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {

  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}