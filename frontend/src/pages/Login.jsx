import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosConfig";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("/auth/login", form);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userEmail", res.data.user.email);
    localStorage.setItem("role", res.data.user.role);

    if (res.data.user.role === "admin") {
      navigate("/admin/add-product");
    } else {
      navigate("/shop");
    }
  } catch (err) {
  if (err.response?.data?.message) {
    setError(err.response.data.message); 
  } else {
    setError("Something went wrong.");
  }
}
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dfe9f3] to-[#f3f7fa] flex justify-center items-center">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-indigo-600 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
