import React, { createContext, useContext, useEffect, useReducer } from "react";
import instance from "../utils/axiosConfig";

export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return Array.isArray(action.payload) ? action.payload : [];
    case "REMOVE_FROM_CART":
      return state.filter((item) => {
        const pid = item?.productId?._id ? item.productId._id.toString() : (typeof item.productId === "string" ? item.productId : null);
        return pid !== action.payload;
      });
    case "ADD_TO_CART":
      {
        const product = action.payload;
        const productId = product?._id ? product._id.toString() : (typeof product === "string" ? product : null);
        if (!productId) return state;
        const idx = state.findIndex(item => {
          const pid = item?.productId?._id ? item.productId._id.toString() : (typeof item.productId === "string" ? item.productId : null);
          return pid === productId;
        });

        if (idx !== -1) {
          const newState = [...state];
          newState[idx] = { ...newState[idx], quantity: (newState[idx].quantity || 0) + 1 };
          return newState;
        } else {
          return [...state, { productId: product, quantity: 1 }];
        }
      }
    case "UPDATE_QUANTITY":
      return state.map(item => {
        const pid = item?.productId?._id ? item.productId._id.toString() : (typeof item.productId === "string" ? item.productId : null);
        if (pid === action.payload.productId) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch({ type: "CLEAR_CART" });
        return;
      }

      const res = await instance.get("/cart");
      const data = res && res.data ? res.data : [];
      dispatch({ type: "SET_CART", payload: Array.isArray(data) ? data : [] });
    } catch (err) {
      console.error("Error fetching cart:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        dispatch({ type: "CLEAR_CART" });
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
      }
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await instance.delete(`/cart/remove/${productId}`);
      dispatch({ type: "REMOVE_FROM_CART", payload: productId });
      await fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err.response?.data || err.message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await instance.put("/cart/update", { productId, quantity });
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
    } catch (err) {
      console.error("Error updating quantity:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchCart();
  }, []);
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item?.productId?.price ?? (typeof item.productId === "object" && item.productId ? item.productId.price : 0);
    const qty = item?.quantity ?? 0;
    const p = Number(price) || 0;
    return total + p * qty;
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + (item.quantity || 0), 0);

  const value = {
    cartItems,
    dispatch,
    fetchCart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
