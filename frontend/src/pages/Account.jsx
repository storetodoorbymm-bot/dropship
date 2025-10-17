import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";

export default function MyAccount() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", contact: "", address: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const res = await axios.get(`/user/me?email=${email}`);
        setUser(res.data);
        setFormData({
          name: res.data.name || "",
          contact: res.data.contact || "",
          address: res.data.address || ""
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "/user/profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div className="p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-indigo-700">My Account</h2>
          {editing ? (
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xl font-bold">
            {user.name?.charAt(0)}
          </div>
          {editing ? (
            <input
              className="border rounded px-2 py-1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          ) : (
            <h3 className="text-lg font-semibold">{user.name}</h3>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <div className="bg-gray-50 p-3 rounded">
            <strong>Email:</strong>
            <p className="text-gray-700">{user.email}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <strong>Contact:</strong>
            {editing ? (
              <input
                className="border rounded px-2 py-1 w-full"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
            ) : (
              <p className="text-gray-700">{user.contact || "N/A"}</p>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <strong>Address:</strong>
            {editing ? (
              <input
                className="border rounded px-2 py-1 w-full"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            ) : (
              <p className="text-gray-700">{user.address || "N/A"}</p>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <strong>Member Since:</strong>
            <p className="text-gray-700">{formatDate(user.dateJoined)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}