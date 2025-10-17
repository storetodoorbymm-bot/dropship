import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate("/shop");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-indigo-50 to-white font-netflix">
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-indigo-800 drop-shadow-md">
          Discover Your Style
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-xl mx-auto">
          Browse premium products, save your favorites, and enjoy a smooth shopping experience.
        </p>
        <button
          onClick={handleShopNow}
          className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-600 transition shadow-md"
        >
          Shop Now
        </button>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-3xl shadow-lg p-6 border-t-4 border-indigo-500">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-2">Curated Collection</h3>
          <p className="text-gray-600">Only top-rated products from trusted sellers.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border-t-4 border-purple-500">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-2">Wishlist Support</h3>
          <p className="text-gray-600">Save products and build your dream cart over time.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border-t-4 border-pink-500">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-2">Fast & Secure Checkout</h3>
          <p className="text-gray-600">Buy with confidence. Simple, fast, and secure process.</p>
        </div>
      </section>
    </div>
  );
}
