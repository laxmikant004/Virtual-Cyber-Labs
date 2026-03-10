import Navbar from "../components/Navbar"

export default function Dashboard() {

  return (

    <div>

      <Navbar />

      <div className="p-10">

        <h1 className="text-3xl font-bold mb-6">
          Virtual Cyber Lab Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white shadow p-6 rounded">
            Kali Linux Lab
          </div>

          <div className="bg-white shadow p-6 rounded">
            Metasploitable Lab
          </div>

          <div className="bg-white shadow p-6 rounded">
            Windows Server Lab
          </div>

        </div>

      </div>

    </div>

  )
}