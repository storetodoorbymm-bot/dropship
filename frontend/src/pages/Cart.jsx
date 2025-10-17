import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import CreateOrder from "../components/CreateOrder";
import PurchaseHistory from "../components/PurchaseHistory";

export default function Cart() {
  const { cartItems, fetchCart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login", { 
          state: { message: "Please login to view your cart" }
        });
        return;
      }
    fetchCart();
  }, []);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePlaceOrder = async ({ name, address, phone, landmark, location }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to checkout");
        return;
      }

      const items = cartItems
        .filter(i => i.productId)
        .map(i => ({
          product: i.productId._id,
          title: i.productId.title || i.productId.name || '',
          price: Number(i.productId.price || 0),
          quantity: i.quantity || 1
        }));

      if (!items.length) {
        alert("Your cart is empty");
        return;
      }

      const payload = {
        items,
        total: Number(cartTotal.toFixed(2)),
        shippingAddress: {
          fullName: name,
          phoneNumber: phone,
          addressLine1: address,
          addressLine2: landmark || '',
          location: location || {}
        },
        paymentMethod: 'COD'
      };

      setPlacing(true);
      const res = await api.post("/orders", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Order placed successfully!");
      await fetchCart();
      setShowOrderForm(false);

      return { orderId: res.data.orderId };

    } catch (err) {
      console.error("Checkout error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Server error during checkout");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-6">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3 justify-center">
                    <span className="text-3xl sm:text-4xl text-center">🛒</span>
                    Your Shopping Cart
                  </h2>
                  <p className="text-blue-100 mt-2 text-sm sm:text-base">
                    {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
                  </p>
                </div>
              </div>
            </div>

            {(!cartItems || cartItems.length === 0) ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="mb-8">
                  <div className="text-6xl sm:text-8xl mb-4">🛒</div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                  <p className="text-base sm:text-xl text-gray-600 mb-8">
                    Looks like you haven't added anything to your cart yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-8 space-y-6">
                {cartItems
                  .filter(item => item.productId)
                  .map((item) => (
                    <div key={item.productId._id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="w-24 h-24 flex-shrink-0">
                          <img src={item.productId.image} alt={item.productId.title} className="w-full h-full object-cover rounded-xl shadow-md" />
                        </div>
                        <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2">{item.productId.title}</h3>
                          <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{item.productId.price}</p>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
                            <span className="text-gray-700 font-medium">Quantity:</span>
                            <div className="flex items-center justify-center gap-3 bg-white rounded-lg border border-gray-300 px-3 py-2">
                              <button onClick={() => handleQuantityChange(item.productId._id, item.quantity - 1)} className="w-8 h-8 bg-red-100 text-red-600 rounded-full">−</button>
                              <span className="w-10 text-center font-bold text-lg text-gray-800">{item.quantity}</span>
                              <button onClick={() => handleQuantityChange(item.productId._id, item.quantity + 1)} className="w-8 h-8 bg-green-100 text-green-600 rounded-full">+</button>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-4 gap-4">
                            <p className="text-lg sm:text-xl font-bold text-gray-800">Subtotal: ₹{(item.productId.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item.productId._id)} className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg">Remove</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                <div className="mt-10 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 border border-gray-200 mx-4 sm:mx-8 mb-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-base sm:text-lg">
                      <span className="font-medium text-gray-700">Total Items:</span>
                      <span className="font-bold text-gray-800">{cartItems.reduce((count, item) => count + item.quantity, 0)}</span>
                    </div>

                    <div className="border-t border-gray-300 pt-4">
                      <div className="flex justify-between items-center text-xl sm:text-2xl font-bold">
                        <span className="text-gray-800">Total Amount:</span>
                        <span className="text-green-600">₹{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button onClick={() => setShowOrderForm(true)} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg">
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </div>

                {showOrderForm && (
                  <div className="fixed inset-0 bg-black/40 flex justify-center items-start p-4 z-[100] overflow-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 mt-24 relative">
                      <button
                        className="inline-flex items-center gap-1 text-base font-medium text-blue-600 hover:text-blue-800 hover:underline mb-6"
                        onClick={() => setShowOrderForm(false)}
                      >
                        ← Back to cart
                      </button>
                      <div className="max-h-[80vh] overflow-y-auto pr-2">
                        <CreateOrder
                          cartItems={cartItems}
                          totalPrice={cartTotal}
                          onPlaceOrder={handlePlaceOrder}
                          placing={placing}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowOrderHistory(true)}
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all text-center items-center justify-center"
            >
              📋 View Purchase History
            </button>
          </div>
        </div>
      </div>

      <PurchaseHistory
        isOpen={showOrderHistory}
        onClose={() => setShowOrderHistory(false)}
      />
    </>
  );
}
