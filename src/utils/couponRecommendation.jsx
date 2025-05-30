import React, { useState, useEffect } from "react";
import {
  Tag,
  X,
  Clipboard,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Gift,
  Info,
} from "lucide-react";
import { BACKEND_URL } from "../Url";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialogComponents";

const CouponRecommendations = ({
  onApplyCoupon,
  currentCartTotal,
  appliedCoupon = null,
}) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [currentCartTotal]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) return;

      const response = await fetch(
        `${BACKEND_URL}coupons/eligible?cartTotal=${currentCartTotal}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }

      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setError("Failed to load available coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleApplyCoupon = async (code) => {
    setApplyingCoupon(code);
    await onApplyCoupon(code);
    setApplyingCoupon(null);
    setDialogOpen(false);
  };

  const calculateSavings = (coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      {
        console.log(currentCartTotal);
      }
      const discountAmount = (currentCartTotal * coupon.discountValue) / 100;
      return coupon.maxDiscountAmount
        ? Math.min(discountAmount, coupon.maxDiscountAmount)
        : discountAmount;
    } else {
      return coupon.discountValue;
    }
  };

  // Sort coupons by best savings first
  const sortedCoupons = [...coupons].sort((a, b) => {
    const savingsA = calculateSavings(a);
    const savingsB = calculateSavings(b);
    return savingsB - savingsA;
  });

  // Display only the best 3 coupons unless showAll is true
  const displayCoupons = showAll ? sortedCoupons : sortedCoupons.slice(0, 3);

  // Check if a coupon is already applied
  const isCouponApplied = (code) => {
    return appliedCoupon && appliedCoupon.code === code;
  };

  // Component to show when loading
  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 mb-4 flex justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-red-500" />
      </div>
    );
  }

  // Component to show when error
  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-700 mb-4 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  // Component to show when no coupons
  if (coupons.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 mb-4">
        <div className="flex items-center text-gray-700">
          <Info className="h-5 w-5 mr-2 text-gray-500" />
          <p>No eligible coupons available for this order.</p>
        </div>
      </div>
    );
  }

  // Main component - Summary view with applied coupon
  return (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div className="bg-red-50 p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Gift className="h-5 w-5 mr-2 text-red-500" />
            <h3 className="font-medium text-gray-800">
              {appliedCoupon ? "Applied Coupon" : "Available Coupons"}
            </h3>
          </div>
          {appliedCoupon ? (
            <button
              onClick={() => onApplyCoupon(null)}
              className="text-sm text-red-500 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </button>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button className="text-sm text-red-500 flex items-center">
                  View All Coupons
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-red-500" />
                    Available Coupons
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto divide-y">
                  {sortedCoupons.map((coupon) => {
                    const savings = calculateSavings(coupon);
                    return (
                      <div key={coupon.code} className="p-4 flex flex-col">
                        <div className="flex items-center mb-1">
                          <Tag className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-gray-800">
                            {coupon.code}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {coupon.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            {coupon.minPurchase > 0 && (
                              <p className="text-xs text-gray-500">
                                Min. purchase: ₹{coupon.minPurchase.toFixed(2)}
                              </p>
                            )}
                            {coupon.expiryDate && (
                              <p className="text-xs text-gray-500">
                                Valid until:{" "}
                                {new Date(
                                  coupon.expiryDate
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-green-600 mr-3">
                              Save ₹{savings.toFixed(2)}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCopyCode(coupon.code)}
                                className="text-gray-500 p-1 rounded hover:bg-gray-100"
                                title="Copy code"
                              >
                                {copied === coupon.code ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clipboard className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleApplyCoupon(coupon.code)}
                                disabled={applyingCoupon === coupon.code}
                                className={`text-xs px-3 py-1 rounded ${
                                  applyingCoupon === coupon.code
                                    ? "bg-gray-200 text-gray-500"
                                    : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                              >
                                {applyingCoupon === coupon.code ? (
                                  <span className="flex items-center">
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    Applying
                                  </span>
                                ) : (
                                  "Apply"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="divide-y">
        {/* Display applied coupon if any */}
        {appliedCoupon && (
          <div className="p-3 bg-green-50 flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium text-gray-800">
                  {appliedCoupon.code}
                </span>
                <span className="ml-2 text-sm text-green-600">Applied</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {appliedCoupon.description}
              </p>
            </div>
            <div className="text-green-600 font-medium">
              {appliedCoupon.discountType === "PERCENTAGE"
                ? `-${appliedCoupon.discountValue}%`
                : `-₹${appliedCoupon.discountValue}`}
            </div>
          </div>
        )}

        {/* Display top 3 coupons in the main view if no coupon is applied */}
        {!appliedCoupon &&
          displayCoupons.map((coupon) => {
            const savings = calculateSavings(coupon);

            return (
              <div
                key={coupon.code}
                className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <Tag className="h-4 w-4 mr-2 text-red-500" />
                    <span className="font-medium text-gray-800">
                      {coupon.code}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{coupon.description}</p>
                </div>

                <div className="mt-3 sm:mt-0 flex items-center">
                  <span className="text-sm font-medium text-green-600 mr-3">
                    Save ₹{savings.toFixed(2)}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="text-gray-500 p-1 rounded hover:bg-gray-100"
                      title="Copy code"
                    >
                      {copied === coupon.code ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clipboard className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleApplyCoupon(coupon.code)}
                      disabled={applyingCoupon === coupon.code}
                      className={`text-xs px-3 py-1 rounded ${
                        applyingCoupon === coupon.code
                          ? "bg-gray-200 text-gray-500"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {applyingCoupon === coupon.code ? (
                        <span className="flex items-center">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Applying
                        </span>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* "View more" button replaced by the Dialog trigger at the top */}
      {!appliedCoupon && coupons.length > 3 && (
        <div className="p-3 bg-gray-50 border-t flex justify-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="text-sm text-gray-600 hover:text-red-500">
                View All Coupons ({coupons.length})
              </button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CouponRecommendations;
