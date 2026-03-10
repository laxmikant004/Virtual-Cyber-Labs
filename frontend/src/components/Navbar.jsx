import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function Navbar() {

  const { logout } = useAuth()

  return (

    <nav className="bg-gray-900 text-white p-4 flex justify-between">

      <h1 className="font-bold text-lg">
        Virtual Cyber Labs
      </h1>

      <button
        onClick={logout}
        className="bg-red-500 px-4 py-2 rounded"
      >
        Logout
      </button>

    </nav>

  )
}