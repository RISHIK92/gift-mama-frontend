import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Trash2,
  AlertCircle,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { BACKEND_URL } from "../Url";

export const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ items: [], wishlistId: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    type: null,
    itemId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${BACKEND_URL}wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch wishlist");
      }

      setWishlist(data); // Direct assignment based on the API response format
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (e, productId) => {
    e.stopPropagation();

    try {
      setActionLoading({ type: "remove", itemId: productId });
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${BACKEND_URL}wishlist/remove`, {
        method: "Delete",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove item");
      }

      setWishlist((prevWishlist) => ({
        ...prevWishlist,
        items: prevWishlist.items.filter(
          (item) => item.productId !== productId
        ),
      }));

      setNotification({
        type: "success",
        message: "Item removed from wishlist",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error removing item:", error);
      setNotification({
        type: "error",
        message: `Failed to remove item: ${error.message}`,
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setActionLoading({ type: null, itemId: null });
    }
  };

  const addToCart = async (e, productId) => {
    e.stopPropagation();

    try {
      setActionLoading({ type: "cart", itemId: productId });
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${BACKEND_URL}cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add item to cart");
      }

      setNotification({
        type: "success",
        message: "Item added to cart successfully",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setNotification({
        type: "error",
        message: `Failed to add to cart: ${error.message}`,
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      window.dispatchEvent(new Event("cartUpdated"));
      setActionLoading({ type: null, itemId: null });
    }
  };

  const navigateToProduct = (productName) => {
    navigate(`/product/${productName}`);
  };

  const WishlistItemSkeleton = () => (
    <div className="flex mb-6 pb-4 border-b border-gray-200 animate-pulse">
      <div className="w-[140px] h-[140px] rounded-md bg-gray-300 mr-3"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-8 bg-gray-300 rounded w-24"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  const Notification = ({ type, message }) => (
    <div
      className={`fixed top-4 right-4 ${
        type === "error" ? "bg-red-500" : "bg-green-500"
      } text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-bounce z-50`}
    >
      <AlertCircle className="mr-2 h-5 w-5" />
      <span>{message}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-medium flex items-center mb-6 italic">
          <span className="text-red-500 mr-2">
            <Heart />
          </span>{" "}
          Your Wishlist
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-full mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/5"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-medium flex items-center mb-6 italic">
          <span className="text-red-500 mr-2">
            <Heart />
          </span>{" "}
          Your Wishlist
        </h1>

        {wishlist.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Your wishlist is empty</p>
            <button
              onClick={() => navigate("/all")}
              className="bg-red-500 text-white px-6 py-2 rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {wishlist.items.map((item) => {
              const isRemoving =
                actionLoading.type === "remove" &&
                actionLoading.itemId === item.productId;
              const isAddingToCart =
                actionLoading.type === "cart" &&
                actionLoading.itemId === item.productId;
              // Extract product data from the nested structure
              const product = item.product;

              return (
                <div
                  key={item.id}
                  className={`border border-gray-200 rounded-lg overflow-hidden transition-all ${
                    isRemoving ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className="h-48 bg-gray-100 cursor-pointer overflow-hidden"
                    onClick={() => navigateToProduct(product.name)}
                  >
                    <img
                      src={
                        (product.images && product.images[0]?.displayImage) ||
                        "/placeholder-image.jpg"
                      }
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-medium text-lg mb-2 cursor-pointer hover:text-red-500 line-clamp-2"
                      onClick={() => navigateToProduct(product.name)}
                    >
                      {product.name}
                    </h3>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        {product.discountedPrice && (
                          <span className="text-gray-500 line-through text-sm mr-2">
                            ₹{parseFloat(product.price).toFixed(2)}
                          </span>
                        )}
                        <span className="font-medium">
                          ₹
                          {parseFloat(
                            product.discountedPrice || product.price
                          ).toFixed(2)}
                        </span>
                      </div>
                      {product.discount && (
                        <span className="text-sm text-green-600 font-medium">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => addToCart(e, item.productId)}
                        className="flex-1 bg-red-500 text-white py-2 rounded flex items-center justify-center"
                        disabled={isAddingToCart || isRemoving}
                      >
                        {isAddingToCart ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => removeItem(e, item.productId)}
                        className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                        disabled={isRemoving || isAddingToCart}
                        title="Remove from wishlist"
                      >
                        {isRemoving ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
