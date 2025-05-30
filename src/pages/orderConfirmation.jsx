import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ShoppingBag,
  Package,
  ArrowRight,
  Home,
  Printer,
} from "lucide-react";
import { BACKEND_URL } from "../Url";

export const OrderConfirmation = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${BACKEND_URL}orders/latest`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(message || "Failed to fetch order details");
      }

      setOrder(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const OrderSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-2/3 mx-auto mb-6"></div>
      <div className="h-20 bg-gray-300 rounded mb-6"></div>
      <div className="h-40 bg-gray-300 rounded mb-6"></div>
      <div className="h-24 bg-gray-300 rounded mb-6"></div>
      <div className="h-12 bg-gray-300 rounded-full w-1/2 mx-auto"></div>
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <OrderSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-medium mb-4">Something went wrong</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-6 py-2 rounded-lg"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-medium mb-4">No Order Found</h1>
        <p className="mb-4">
          We couldn't find your recent order. Please check your orders in your
          account.
        </p>
        <button
          onClick={() => navigate("/profile")}
          className="bg-red-500 text-white px-6 py-2 rounded-lg"
        >
          Go to My Account
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-medium mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Your order #{order.orderNumber} has been placed successfully.
        </p>
        {/* <p className="text-gray-600">
          A confirmation email has been sent to {order.customer?.email || 'your email address'}.
        </p> */}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Order Summary</h2>
          <button
            onClick={handlePrint}
            className="text-red-500 flex items-center text-sm"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </button>
        </div>

        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between mb-2">
            <span>Order Number:</span>
            <span className="font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Order Date:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Payment Method:</span>
            <span>{order.paymentMethod || "Online Payment"}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2">Items Ordered</h3>
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between py-2 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex">
                <span className="mr-2">{item.quantity}x</span>
                <span>{item.product.name}</span>
              </div>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{order?.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>₹{order?.deliveryFee.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="text-green-500">
                -₹{order?.discount.toFixed(2)}
              </span>
            </div>
          )}
          {order.walletAmountUsed > 0 && (
            <div className="flex justify-between">
              <span>Wallet Credit Used:</span>
              <span className="text-green-500">
                -₹{order?.walletAmountUsed.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₹{order?.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span className="text-red-500">₹{order?.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-4">Shipping Details</h2>
        <div className="flex items-start">
          <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {order.shippingAddress?.name || "Your Name"}
            </p>
            <p>
              {order.shippingAddress?.line1 ||
                "Door No.A3, Block, Street Number 1,"}
            </p>
            <p>{order.shippingAddress?.line2 || "Walker Town,"}</p>
            <p>
              {order.shippingAddress?.city || "Secunderabad"},{" "}
              {order.shippingAddress?.state || "Telangana"}{" "}
              {order.shippingAddress?.postalCode || "500025"}
            </p>
            <p>{order.shippingAddress?.country || "India"}</p>
            <p className="mt-2">
              Phone: {order.shippingAddress?.phone || "+91XXXXXXXXXX"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-4">Estimated Delivery</h2>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-2 bg-red-500 rounded-full relative mb-4">
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 h-4 w-4 rounded-full bg-red-500"></div>
              <div className="absolute top-1/2 left-1/3 transform -translate-y-1/2 h-4 w-4 rounded-full bg-gray-300"></div>
              <div className="absolute top-1/2 left-2/3 transform -translate-y-1/2 h-4 w-4 rounded-full bg-gray-300"></div>
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 h-4 w-4 rounded-full bg-gray-300"></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Order Placed</span>
              <span className="text-gray-400">Processing</span>
              <span className="text-gray-400">Shipped</span>
              <span className="text-gray-400">Delivered</span>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm">
          Expected delivery by{" "}
          <span className="font-medium">
            {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
          </span>
        </p>
      </div>

      <div className="flex justify-between my-8">
        <button
          onClick={() => navigate("/orders")}
          className="bg-white border border-red-500 text-red-500 px-6 py-2 rounded-lg flex items-center"
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          My Orders
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-6 py-2 rounded-lg flex items-center"
        >
          Continue Shopping
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

const MapPin = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
};
