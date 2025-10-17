import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../utils/axiosConfig';

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", contact: "", address: "" });
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/send-otp", { email: form.email });
      setStep(2);
      setError("");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);  
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/verify-otp", { email: form.email, otp });
      if (res.data.verified) {
        await axios.post("/auth/signup", form);
        navigate("/login");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Signup failed. Email might already be in use.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dfe9f3] to-[#f3f7fa] flex justify-center items-center">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          {step === 1 ? "Sign Up" : "Verify OTP"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
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
            <input
              type="text"
              name="contact"
              placeholder="Contact"
              value={form.contact}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndSignup} className="space-y-5">
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Verify & Sign Up
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
