import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [error, setError] = useState(null);

  const { dispatch: cartDispatch, fetchCart } = useCart() || {};
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const token = localStorage.getItem("token");

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/product/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error("Failed to fetch product:", err.message);
      if (err.response?.status === 404) {
        setError("Product not found");
      } else {
        setError("Failed to load product. Please try again.");
      }
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    setAddedToCart(false);
  }, [id]);

  const handleAddToCart = async () => {
    if (!token) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!product?._id) {
      alert("Product information not available");
      return;
    }

    if (product.stock <= 0) {
      alert("Product is out of stock");
      return;
    }

    setAddingToCart(true);
    try {
      const response = await api.post("/cart/add", {
        productId: product._id,
        quantity: 1,
      });

      if (cartDispatch) {
        cartDispatch({ type: "ADD_TO_CART", payload: product });
      }

      if (fetchCart) {
        await fetchCart();
      }

      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
      
    } catch (error) {
      console.error("Failed to add to cart:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else if (error.response?.status === 400) {
        alert(error.response?.data?.message || "Invalid request. Please try again.");
      } else if (error.response?.status === 404) {
        alert("Product not found or no longer available.");
      } else {
        alert(error.response?.data?.message || "Failed to add to cart. Please try again.");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const productInWishlist = React.useMemo(() => {
  return product?._id ? isInWishlist(product._id) : false;
}, [product?._id, isInWishlist]);

  const handleWishlistToggle = async () => {
    if (!token) {
      alert("Please login to manage wishlist");
      navigate("/login");
      return;
    }

    if (!product?._id) {
      alert("Product information not available");
      return;
    }

    setWishlistLoading(true);
    try {
      if (productInWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      console.error("Wishlist update failed:", err);
      
      if (err.message.includes("login")) {
        navigate("/login");
      } else {
        alert(err.message || "Failed to update wishlist. Please try again.");
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading product...</p>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-2xl mb-4">
          {error || "Product not found"}
        </div>
        <p className="text-gray-600 mb-6">
          {error === "Product not found" 
            ? "The product you're looking for doesn't exist or has been removed."
            : "Something went wrong. Please try refreshing the page."
          }
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Go Back
          </button>
          <button
            onClick={fetchProduct}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="relative">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={product.image || '/placeholder-image.jpg'}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
        {productInWishlist && (
          <div className="absolute top-4 right-4 bg-pink-500 text-white p-2 rounded-full shadow-lg">
            <span className="text-lg">❤️</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            {product.title}
          </h1>
          <p className="text-3xl lg:text-4xl font-bold text-green-600">
            ₹{product.price?.toLocaleString()}
          </p>
        </div>

        {product.description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4">
          {product.rating && (
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-lg">
              <span className="text-yellow-500 text-lg">⭐</span>
              <span className="text-gray-700 font-medium">{product.rating}</span>
            </div>
          )}
          
          {product.stock !== undefined && (
            <div className={`px-3 py-1 rounded-lg font-medium ${
              product.stock > 0 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {product.stock > 0 
                ? `${product.stock} in stock` 
                : 'Out of stock'
              }
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-1 font-medium"
          >
            {addingToCart
              ? "Adding to Cart..."
              : addedToCart
              ? "Added to Cart"
              : product.stock === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </button>

          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading || !token}
            className={`${
              productInWishlist 
                ? "bg-pink-500 hover:bg-pink-600" 
                : "bg-gray-600 hover:bg-gray-700"
            } text-white px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-1 font-medium`}
          >
            {wishlistLoading
              ? "Updating..."
              : productInWishlist
              ? "❤️ Remove from Wishlist"
              : "🤍 Add to Wishlist"}
          </button>
        </div>

        {!token && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-700 mb-2">
              Please login to add items to cart or wishlist
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Login now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}