import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  ShoppingCart,
  Trash2,
  AlertCircle,
  RefreshCw,
  Image,
  ChevronRight,
} from "lucide-react";
import { BACKEND_URL } from "../Url";
import AddressModal from "../components/addressModel";
import CouponRecommendations from "../utils/couponRecommendation";

export const Cart = () => {
  const [cart, setCart] = useState({
    items: [],
    summary: { subtotal: 0, discount: 0, total: 0, deliveryFee: 0, tax: 0 },
  });
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    type: null,
    itemId: null,
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const navigate = useNavigate();

  // Calculate the final amount considering wallet balance
  const calculateFinalAmount = () => {
    const cartTotal = cart.summary.total;
    if (useWallet) {
      return Math.max(cartTotal - walletBalance, 0);
    }
    return cartTotal;
  };

  useEffect(() => {
    fetchCart();
    fetchAppliedCoupon();
    fetchWalletBalance();
    fetchDefaultAddress();
  }, []);

  // Fetch default address
  const fetchDefaultAddress = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${BACKEND_URL}user/default-address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        // No default address found, that's okay
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch default address");
      }

      const data = await response.json();
      setSelectedAddress(data);
    } catch (error) {
      console.error("Error fetching default address:", error);
      // We don't want to show an error for this
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${BACKEND_URL}wallet/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch wallet balance");
      }

      setWalletBalance(data.balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      setError(error.message);
    }
  };

  const fetchAppliedCoupon = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${BACKEND_URL}cart/coupon`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setAppliedCoupon(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch applied coupon");
      }

      const data = await response.json();
      setAppliedCoupon(data.coupon);
    } catch (error) {
      console.error("Error fetching applied coupon:", error);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${BACKEND_URL}cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (e, itemId, newQuantity) => {
    e.stopPropagation();

    try {
      setActionLoading({ type: "update", itemId });
      const token = localStorage.getItem("authToken");

      // Find the item in cart to check stock
      const cartItem = cart.items.find((item) => item.id === itemId);
      if (!cartItem) {
        throw new Error("Item not found in cart");
      }

      // Check if new quantity exceeds available stock
      if (newQuantity > cartItem.product.stock) {
        throw new Error(
          `Only ${cartItem.product.stock} items available in stock`
        );
      }

      const response = await fetch(`${BACKEND_URL}cart/item/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update quantity");
      }

      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));

      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError(`Failed to update quantity: ${error.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading({ type: null, itemId: null });
    }
  };

  const removeItem = async (e, itemId) => {
    e.stopPropagation();

    try {
      setActionLoading({ type: "remove", itemId });
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${BACKEND_URL}cart/item/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove item");
      }

      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter((item) => item.id !== itemId),
      }));

      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      setError(`Failed to remove item: ${error.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      window.dispatchEvent(new Event("cartUpdated"));
      setActionLoading({ type: null, itemId: null });
    }
  };

  const handleApplyCouponFromRecommendation = async (code) => {
    if (!code) {
      // Handle coupon removal
      try {
        const token = localStorage.getItem("authToken");

        const response = await fetch(`${BACKEND_URL}cart/coupon`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to remove coupon");
        }

        setAppliedCoupon(null);
        fetchCart();
      } catch (error) {
        console.error("Error removing coupon:", error);
        setError(`Failed to remove coupon: ${error.message}`);
        setTimeout(() => setError(null), 3000);
      }
      return;
    }

    // Apply the coupon code
    try {
      setCouponError(null);
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${BACKEND_URL}cart/coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid coupon code");
      }

      setAppliedCoupon(data.coupon);
      fetchCart();
      setCouponCode("");
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError(error.message);
      setTimeout(() => setCouponError(null), 3000);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setActionLoading({ type: "apply", itemId: null });
      setCouponError(null);
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${BACKEND_URL}cart/coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid coupon code");
      }

      setAppliedCoupon(data.coupon);

      fetchCart();
      setCouponCode("");
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError(error.message);
      setTimeout(() => setCouponError(null), 3000);
    } finally {
      setActionLoading({ type: null, itemId: null });
    }
  };

  const navigateToProduct = (productName) => {
    navigate(`/product/${productName}`);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const CartItemSkeleton = () => (
    <div className="flex mb-6 pb-4 border-b border-gray-200 animate-pulse">
      <div className="w-[140px] h-[140px] rounded-md bg-gray-300 mr-3"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-8 bg-gray-300 rounded-full w-24"></div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  const ErrorToast = ({ message }) => (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-bounce">
      <AlertCircle className="mr-2 h-5 w-5" />
      <span>{message}</span>
    </div>
  );

  // Function to get customization details for all items
  const getCustomizationDetails = () => {
    return cart.items.map((item) => {
      // Process customization details
      let customizationDetails = null;
      let customizationImageUrls = [];

      // If customizationImageUrls is available as an array, use directly
      if (
        item.customizationImageUrls &&
        Array.isArray(item.customizationImageUrls)
      ) {
        customizationImageUrls = item.customizationImageUrls;
      }

      // If customizationDetails is available, parse if needed
      if (item.customizationDetails) {
        try {
          // Handle string format and convert to object if needed
          const details =
            typeof item.customizationDetails === "string"
              ? JSON.parse(item.customizationDetails)
              : item.customizationDetails;

          customizationDetails = details;
        } catch (error) {
          console.error("Error parsing customization details:", error);
        }
      }

      return {
        itemId: item.id,
        productId: item.product.id,
        customizationImageUrls: customizationImageUrls,
        customizationDetails: customizationDetails,
        quantity: item.quantity,
      };
    });
  };

  const initializeRazorpayCheckout = async () => {
    try {
      if (!selectedAddress) {
        setError("Please select a delivery address");
        return;
      }

      const token = localStorage.getItem("authToken");
      const finalAmount = calculateFinalAmount();

      // Get the customization details for all cart items
      const customizationDetails = getCustomizationDetails();

      const response = await fetch(`${BACKEND_URL}create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: finalAmount,
          currency: "INR",
          receipt: `order_${Date.now()}`,
          useWallet: useWallet,
          deliveryFee: cart.summary.deliveryFee,
          walletAmount: useWallet
            ? Math.min(
                walletBalance,
                cart.summary.total + cart.summary.deliveryFee + cart.summary.tax
              )
            : 0,
          shippingAddress: {
            name: selectedAddress.name,
            line1: selectedAddress.line1,
            line2: selectedAddress.line2 || "",
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country,
            phone: selectedAddress.phone,
          },
          notes: `Order placed on ${new Date().toLocaleString()}`,
          cartItems: customizationDetails, // Sending the updated customization details
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const options = {
        key: "rzp_test_IiBhDWqxB82lQj",
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "Your Company Name",
        description: "Cart Checkout",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${BACKEND_URL}verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                useWallet: useWallet,
                walletAmount: useWallet
                  ? Math.min(
                      walletBalance,
                      cart.summary.total +
                        cart.summary.deliveryFee +
                        cart.summary.tax
                    )
                  : 0,
                customizationDetails: customizationDetails, // Send customization details again with payment verification
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.status === "success") {
              navigate("/order-confirmation");
            } else {
              setError("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setError("Failed to verify payment");
          }
        },
        prefill: {
          name: selectedAddress.name,
          email: "customer@example.com",
          contact: selectedAddress.phone,
        },
        notes: {
          address: `${selectedAddress.line1}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.postalCode}`,
          customizations: JSON.stringify(customizationDetails), // Add customization details to Razorpay notes
        },
        theme: {
          color: "#FF2A2A",
        },
      };

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        setError("Failed to load payment gateway");
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message);
      setCheckoutLoading(false);
    }
    setTimeout(() => {
      setCheckoutLoading(false);
    }, 1500);
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);

    if (cart.items.length === 0) {
      setError("Your cart is empty");
      setCheckoutLoading(false);
      return;
    }

    if (!selectedAddress) {
      setIsAddressModalOpen(true);
      setCheckoutLoading(false);
      return;
    }

    initializeRazorpayCheckout();
  };

  const getCustomizationImages = (item) => {
    // If customizationImageUrls exists and is an array, use that directly
    if (
      item.customizationImageUrls &&
      Array.isArray(item.customizationImageUrls)
    ) {
      return item.customizationImageUrls.filter(
        (url) => url && url.trim() !== ""
      );
    }

    // Fallback to other possible image sources if needed
    let images = [];

    // Check for single image URL (legacy support)
    if (item.customizationImageUrl) {
      images.push(item.customizationImageUrl);
    }

    // Check customizationDetails for any embedded images
    if (item.customizationDetails) {
      try {
        const details =
          typeof item.customizationDetails === "string"
            ? JSON.parse(item.customizationDetails)
            : item.customizationDetails;

        // Check various possible image locations in the details
        if (details.imageUrl) images.push(details.imageUrl);
        if (details.uploadedImage) images.push(details.uploadedImage);
        if (details.uploads && Array.isArray(details.uploads)) {
          details.uploads.forEach((upload) => {
            if (upload.imageUrl) images.push(upload.imageUrl);
          });
        }
      } catch (error) {
        console.error("Error parsing customization details:", error);
      }
    }

    return images.length > 0 ? images : null;
  };

  const CustomizationImages = ({ images, onClick }) => {
    if (!images || images.length === 0) return null;

    return (
      <div
        className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full shadow-md border-2 border-white overflow-hidden bg-white flex items-center justify-center cursor-pointer"
        onClick={onClick}
      >
        <img
          src={images[0]}
          alt="Customization"
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              +{images.length - 1}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Modal to show all customization images
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeImages, setActiveImages] = useState([]);

  const ImageModal = () => {
    if (!showImageModal || activeImages.length === 0) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
        onClick={() => setShowImageModal(false)}
      >
        <div
          className="bg-white rounded-lg p-4 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Custom Designs ({activeImages.length})
            </h3>
            <button
              onClick={() => setShowImageModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {activeImages.map((img, idx) => (
              <div key={idx} className="border rounded-md overflow-hidden">
                <div className="p-2 bg-gray-50 text-sm font-medium">
                  Design {idx + 1}
                </div>
                <div className="aspect-square bg-gray-100">
                  <img
                    src={img}
                    alt={`Customization ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const openImageModal = (images) => {
    setActiveImages(images);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-medium flex items-center mb-6 italic">
          <span className="text-red-500 mr-2">
            <ShoppingCart />
          </span>{" "}
          Your Cart
        </h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {[1, 2, 3].map((i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
          <div className="w-full lg:w-80">
            <div className="h-8 bg-gray-300 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
            <div className="h-40 bg-gray-300 rounded w-full mb-4"></div>
            <div className="h-12 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && <ErrorToast message={error} />}
      {couponError && <ErrorToast message={couponError} />}

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressSelect={handleAddressSelect}
      />

      <ImageModal />

      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-medium flex items-center mb-6 italic">
          <span className="text-red-500 mr-2">
            <ShoppingCart />
          </span>{" "}
          Your Cart
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate("/all")}
              className="bg-red-500 text-white px-6 py-2 rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {cart.items.map((item) => {
                const product = item.product;
                const price = Number(product.price);
                const discountedPrice = product.discountedPrice
                  ? Number(product.discountedPrice)
                  : price;
                const itemTotal = discountedPrice * item.quantity;
                const itemDiscount = (price - discountedPrice) * item.quantity;
                const isUpdating =
                  actionLoading.type === "update" &&
                  actionLoading.itemId === item.id;
                const isRemoving =
                  actionLoading.type === "remove" &&
                  actionLoading.itemId === item.id;
                const customImages = getCustomizationImages(item);

                return (
                  <div
                    key={item.id}
                    className={`flex mb-6 pb-4 border-b border-gray-200 ${
                      isRemoving ? "opacity-50 animate-pulse" : ""
                    }`}
                  >
                    <div className="relative w-[140px] h-[140px] mr-3">
                      <div
                        className="w-full h-full rounded-md bg-gray-200 overflow-hidden cursor-pointer"
                        onClick={() => navigateToProduct(product.name)}
                      >
                        <img
                          src={
                            product.images[0]?.mainImage ||
                            product.images[0]?.displayImage ||
                            "/placeholder-image.jpg"
                          }
                          className="w-full h-full object-cover"
                          alt={product.name}
                        />
                      </div>

                      {customImages && customImages.length > 0 && (
                        <CustomizationImages
                          images={customImages}
                          onClick={() => openImageModal(customImages)}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div
                        className="font-medium text-lg mb-1 cursor-pointer hover:text-red-500"
                        onClick={() => navigateToProduct(product.name)}
                      >
                        {product.name}
                      </div>

                      <div className="text-sm text-gray-500">
                        {product.color && `Color: ${product.color}`}
                        {product.size && product.color && ` | `}
                        {product.size && `Size: ${product.size}`}
                        {customImages && customImages.length > 0 && (
                          <span
                            className="ml-2 text-blue-600 cursor-pointer"
                            onClick={() => openImageModal(customImages)}
                          >
                            {customImages.length} Custom Design
                            {customImages.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center border border-gray-300 rounded-full">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-gray-500"
                            onClick={(e) => {
                              if (item.quantity > 1) {
                                updateQuantity(e, item.id, item.quantity - 1);
                              }
                            }}
                            disabled={item.quantity <= 1 || isUpdating}
                          >
                            -
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center">
                            {isUpdating ? (
                              <RefreshCw className="h-4 w-4 animate-spin text-red-500" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-gray-500"
                            onClick={(e) =>
                              updateQuantity(e, item.id, item.quantity + 1)
                            }
                            disabled={
                              isUpdating || item.quantity >= product.stock
                            }
                          >
                            +
                          </button>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="flex items-center">
                            {product.discountedPrice && (
                              <span className="text-gray-500 line-through text-sm mr-2">
                                ₹{(price * item.quantity).toFixed(2)}
                              </span>
                            )}
                            <span className="font-medium">
                              ₹{itemTotal.toFixed(2)}
                            </span>
                          </div>

                          {itemDiscount > 0 && (
                            <span className="text-green-600 text-sm">
                              You save ₹{itemDiscount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between">
                        {customImages && customImages.length > 0 && (
                          <button
                            onClick={() => openImageModal(customImages)}
                            className="text-blue-600 text-sm flex items-center"
                          >
                            View Designs{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        )}

                        <button
                          className="text-red-500 text-sm flex items-center"
                          onClick={(e) => removeItem(e, item.id)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Section */}
            <div className="w-full lg:w-80 space-y-4">
              {/* Delivery Address Section */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Delivery Address</h3>
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    {selectedAddress ? "Change" : "Add"}
                  </button>
                </div>

                {selectedAddress ? (
                  <div className="text-sm">
                    <div className="font-medium">{selectedAddress.name}</div>
                    <div>{selectedAddress.line1}</div>
                    {selectedAddress.line2 && (
                      <div>{selectedAddress.line2}</div>
                    )}
                    <div>
                      {selectedAddress.city}, {selectedAddress.state}{" "}
                      {selectedAddress.postalCode}
                    </div>
                    <div>{selectedAddress.country}</div>
                    <div className="mt-1">{selectedAddress.phone}</div>
                  </div>
                ) : (
                  <div
                    className="flex items-center text-gray-500 cursor-pointer"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>Select a delivery address</span>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <h3 className="font-medium mb-3">Apply Coupon</h3>

                {appliedCoupon ? (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md flex justify-between items-center">
                    <div>
                      <div className="font-medium text-green-700">
                        {appliedCoupon.code}
                      </div>
                      <div className="text-xs text-green-600">
                        {appliedCoupon.description}
                      </div>
                    </div>
                    <button
                      className="text-red-500 text-sm"
                      onClick={() => handleApplyCouponFromRecommendation(null)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex mb-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      className="bg-red-500 text-white px-3 py-2 rounded-r-md text-sm focus:outline-none disabled:bg-gray-400"
                      onClick={applyCoupon}
                      disabled={
                        actionLoading.type === "apply" || !couponCode.trim()
                      }
                    >
                      {actionLoading.type === "apply" ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                )}

                {/* Coupon Recommendations */}
                <CouponRecommendations
                  currentCartTotal={cart.summary.subtotal}
                  onApplyCoupon={handleApplyCouponFromRecommendation}
                  appliedCoupon={appliedCoupon}
                />
              </div>

              {/* Wallet Section */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Use Wallet Balance</h3>
                    <p className="text-sm text-gray-500">
                      Available: ₹{walletBalance}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={useWallet}
                      onChange={() => setUseWallet(!useWallet)}
                      disabled={walletBalance <= 0}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">Order Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      Subtotal (
                      {cart.items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                      items)
                    </span>
                    <span>₹{cart.summary.subtotal.toFixed(2)}</span>
                  </div>

                  {cart.summary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{cart.summary.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{cart.summary.deliveryFee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{cart.summary.tax.toFixed(2)}</span>
                  </div>

                  {useWallet && walletBalance > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Wallet Credit</span>
                      <span>
                        -₹
                        {Math.min(
                          walletBalance,
                          cart.summary.total +
                            cart.summary.deliveryFee +
                            cart.summary.tax
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{calculateFinalAmount().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="w-full bg-red-500 text-white py-3 rounded-lg mt-4 font-medium hover:bg-red-600 transition-colors focus:outline-none flex items-center justify-center"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cart.items.length === 0}
                >
                  {checkoutLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
