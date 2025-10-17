import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import ReturnButton from "./ReturnButton";

const PurchaseHistory = ({ isOpen, onClose }) => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchOrderHistory();
    }
  }, [isOpen]);

const cancelOrder = async (orderId) => {
  try {
    const res = await api.put(`/orders/cancel/${orderId}`);
    alert(res.data.message);

    setOrderHistory((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, status: "cancelled" } : o
      )
    );
  } catch (err) {
    alert(err.response?.data?.message || "Error cancelling order");
  }
};

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view order history");
        return;
      }

      const response = await api.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrderHistory(response.data || []);
    } catch (error) {
      console.error("Error fetching order history:", error);
      setError("Failed to fetch order history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start p-4 z-[100] overflow-auto pt-16">
      <div className="bg-white rounded-2xl w-full max-w-5xl p-6 mt-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-2xl">📋</span>
              Purchase History
            </h2>
            <p className="text-gray-600 mt-1">View and manage your past orders</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading your orders...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
            <button
              onClick={fetchOrderHistory}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && orderHistory.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders. Start shopping to see your purchase
              history!
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orderHistory.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Showing {orderHistory.length} order
              {orderHistory.length !== 1 ? "s" : ""}
            </div>

            {orderHistory.map((order) => (
              <div
                key={order._id}
                className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
              >

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {(order.status || "pending")
                          .charAt(0)
                          .toUpperCase() + (order.status || "pending").slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment:{" "}
                      <span className="font-medium">
                        {order.paymentMethod || "COD"}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ₹{Number(order.total || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items?.length || 0} item
                      {(order.items?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Items:
                  </h4>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="space-y-2">
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-700 flex-1">
                            <span className="font-medium">
                              {item.name || "Unknown Item"}
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              × {item.quantity || 1}
                            </span>
                          </span>
                          <span className="font-medium text-gray-800">
                            ₹
                            {(
                              (item.price || 0) * (item.quantity || 1)
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Shipping Address:
                    </h4>
                    <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm text-gray-600">
                      <p className="font-medium">
                        {order.shippingAddress.fullName ||
                          order.shippingAddress.name}
                      </p>
                      <p>
                        {order.shippingAddress.addressLine1 ||
                          order.shippingAddress.address}
                      </p>
                      {order.shippingAddress.addressLine2 && (
                        <p>{order.shippingAddress.addressLine2}</p>
                      )}
                      {order.shippingAddress.landmark && (
                        <p>Landmark: {order.shippingAddress.landmark}</p>
                      )}
                      <p>
                        {order.shippingAddress.phoneNumber ||
                          order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {order.status === "pending" && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <span>❌</span>
                      Cancel Order
                    </button>
                  )}

                  {(order.status === "delivered" || order.status === "completed") && (
                    <ReturnButton orderId={order._id} onReturn={fetchOrderHistory} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="mt-6 text-center">
            <button
              onClick={fetchOrderHistory}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              🔄 Refresh Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
