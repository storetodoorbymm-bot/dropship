import React, {createContext,useContext,useEffect,useState,useCallback,useRef,} from "react";
import instance from "../utils/axiosConfig";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const normalizeWishlistItem = (item) => {
    if (!item) return null;
    if (typeof item === "string") {
      return { _id: item };
    }
    if (item._id) return item;
    if (item.productId && (typeof item.productId === "string" || item.productId._id)) {
      return typeof item.productId === "string"
        ? { _id: item.productId }
        : item.productId;
    }
    return item;
  };

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlist([]);
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      const res = await instance.get("/wishlist");
      const data = res && res.data ? res.data : [];
      const arr = Array.isArray(data) ? data : [];
      const normalized = arr
        .map(normalizeWishlistItem)
        .filter(Boolean); 

      if (mountedRef.current) setWishlist(normalized);
    } catch (err) {
      console.error("Error fetching wishlist:", err.response?.data || err.message);
      if (mountedRef.current) {
        if (err.response?.status === 401) {
          setWishlist([]);
          localStorage.removeItem("token");
        }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const getIdFromItem = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    if (item._id) return item._id.toString();
    if (item.productId) {
      if (typeof item.productId === "string") return item.productId;
      if (item.productId._id) return item.productId._id.toString();
    }
    return null;
  };

  const addToWishlist = useCallback(
    async (productId) => {
      if (!productId) throw new Error("Product ID is required");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login to add items to wishlist");
        const alreadyExists = wishlist.some((it) => getIdFromItem(it) === productId);
        if (alreadyExists) {
          throw new Error("Product is already in your wishlist");
        }

        await instance.post("/wishlist/add", { productId });
        await fetchWishlist();
        return true;
      } catch (err) {
        console.error("Error adding to wishlist:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Please login to add items to wishlist");
        } else if (err.response?.status === 400) {
          throw new Error(err.response?.data?.message || "Product already in wishlist");
        } else if (err.response?.status === 404) {
          throw new Error("Product not found");
        } else {
          throw new Error(err.response?.data?.message || "Failed to add to wishlist");
        }
      }
    },
    [wishlist, fetchWishlist]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!productId) throw new Error("Product ID is required");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login to manage wishlist");

        const original = [...wishlist];
        setWishlist((prev) => prev.filter((p) => getIdFromItem(p) !== productId));

        try {
          await instance.delete(`/wishlist/remove/${productId}`);
          return true;
        } catch (apiErr) {
          setWishlist(original);
          throw apiErr;
        }
      } catch (err) {
        console.error("Error removing from wishlist:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Please login to manage wishlist");
        } else if (err.response?.status === 404) {
          return true;
        } else {
          throw new Error(err.response?.data?.message || "Failed to remove from wishlist");
        }
      }
    },
    [wishlist]
  );

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId || !Array.isArray(wishlist)) return false;
      return wishlist.some((item) => getIdFromItem(item) === productId);
    },
    [wishlist]
  );

  const getWishlistCount = useCallback(() => (Array.isArray(wishlist) ? wishlist.length : 0), [
    wishlist,
  ]);

  const clearWishlist = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to manage wishlist");
      await instance.delete("/wishlist/clear");
      setWishlist([]);
      return true;
    } catch (err) {
      console.error("Error clearing wishlist:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Failed to clear wishlist");
    }
  }, []);

  const toggleWishlist = useCallback(
    async (productId) => {
      try {
        if (isInWishlist(productId)) {
          await removeFromWishlist(productId);
          return false;
        } else {
          await addToWishlist(productId);
          return true;
        }
      } catch (err) {
        throw err;
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && mountedRef.current) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }

  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "token") {
        if (e.newValue) fetchWishlist();
        else setWishlist([]);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [fetchWishlist]);

  const value = React.useMemo(
    () => ({
      wishlist: Array.isArray(wishlist) ? wishlist : [],
      loading,
      fetchWishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      getWishlistCount,
      clearWishlist,
      toggleWishlist,
    }),
    [wishlist, loading, fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount, clearWishlist, toggleWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
