export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex flex-col">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6">
        <h1 className="text-2xl font-bold text-green-700">Upyog ♻️</h1>
        <a
          href="/upload"
          className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
        >
          Get Started
        </a>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h2 className="text-5xl font-extrabold text-gray-800 leading-tight">
          Give Your Old Items  
          <span className="text-green-600"> A New Life</span>
        </h2>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl">
          Upload any product and let AI help you decide whether to
          sell it, recycle it sustainably, or transform it with creative DIY ideas.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="/upload"
            className="bg-green-600 text-white px-8 py-3 rounded-full text-lg hover:bg-green-700 transition"
          >
            Upload Item
          </a>

          <button className="border border-green-600 text-green-700 px-8 py-3 rounded-full text-lg hover:bg-green-100 transition">
            Learn More
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 px-10 py-16 bg-white">
        <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-green-700">💰 Sell Smart</h3>
          <p className="mt-3 text-gray-600">
            Get AI-predicted resale price in Indian market instantly.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-green-700">🌍 Environmental Impact</h3>
          <p className="mt-3 text-gray-600">
            See how much CO₂ and waste you save by recycling.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-green-700">🛠 DIY Innovation</h3>
          <p className="mt-3 text-gray-600">
            Get creative AI-powered DIY ideas using Gemma.
          </p>
        </div>
      </div>

    </div>
  );
}