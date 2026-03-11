import Navbar from "../components/Navbar"

export default function Dashboard() {

  const labs = [
    { name: "Kali Linux", desc: "Penetration testing environment" },
    { name: "Metasploitable", desc: "Vulnerable machine for exploitation" },
    { name: "Windows Server", desc: "Active Directory environment" }
  ]

  return (

    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-3xl font-bold mb-8">
          Cyber Security Lab Dashboard
        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          {labs.map((lab, index) => (

            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">
                {lab.name}
              </h2>

              <p className="text-gray-600 mb-4">
                {lab.desc}
              </p>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Launch Lab
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>

  )
}