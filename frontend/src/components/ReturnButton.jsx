import React, { useState } from "react";
import api from "../utils/axiosConfig";

export default function ReturnButton({ orderId, onReturn }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const handleReturn = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for return.");
      return;
    }

    try {
      const { data } = await api.put(`/orders/return/${orderId}`, { reason }); 
      alert(data.message);
      setShowModal(false);
      if (onReturn) onReturn();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to return order.");
    }
  };

  return (
    <>
      <button
        className="flex items-center gap-2 bg-red-300 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium"
        onClick={() => setShowModal(true)}
      >
        🔄 Return Order
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Return Order</h2>
            <label className="block text-sm font-medium mb-1">
              Reason for Return:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="Type your reason here..."
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={handleReturn}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
