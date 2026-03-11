import { useAuth } from "../contexts/AuthContext"

export default function Navbar() {

  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (

    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">

      <h1 className="font-bold text-lg">
        Virtual Cyber Labs
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>

    </nav>
  )
}