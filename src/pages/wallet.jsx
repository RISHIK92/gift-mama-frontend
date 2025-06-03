import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  IndianRupee,
  RefreshCw,
  AlertCircle,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BACKEND_URL } from "../Url";

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const formatCurrency = (amount) => {
    const safeAmount = typeof amount === "number" ? amount : 0;
    return safeAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast.error("Failed to load Razorpay. Please try again later.");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const renderTransactionIcon = (type) => {
    return type === "credit" ? (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
        <ArrowDownRight className="text-green-600" size={20} />
      </div>
    ) : (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
        <ArrowUpRight className="text-red-600" size={20} />
      </div>
    );
  };

  const fetchWalletData = async (page = 1) => {
    const token = localStorage.getItem("authToken");
    setIsLoading(true);
    setError(null);
    try {
      const [balanceResponse, transactionsResponse] = await Promise.all([
        fetch(`${BACKEND_URL}wallet/balance`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}wallet/transactions?page=${page}&limit=10`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!balanceResponse.ok || !transactionsResponse.ok) {
        throw new Error("Failed to fetch wallet information");
      }

      const balanceData = await balanceResponse.json();
      const transactionsData = await transactionsResponse.json();

      setBalance(parseFloat(balanceData.balance) || 0);

      const formattedTransactions =
        transactionsData.transactions?.map((tx) => ({
          ...tx,
          amount: parseFloat(tx.amount),
          createdAt: tx.createdAt,
        })) || [];

      setTransactions(formattedTransactions);

      setPagination({
        currentPage: transactionsData.pagination?.currentPage || 1,
        totalPages: transactionsData.pagination?.totalPages || 1,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch wallet information");
      toast.error(err.message || "Failed to fetch wallet information");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchWalletData(newPage);
    }
  };

  const initiateRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast.error(
        "Razorpay is not loaded. Please refresh the page and try again."
      );
      return;
    }

    const token = localStorage.getItem("authToken");
    const amount = Number.parseFloat(addMoneyAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const orderResponse = await fetch(`${BACKEND_URL}wallet/create-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      const options = {
        key: "rzp_test_IiBhDWqxB82lQj",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PhotoMama",
        description: "Wallet Top-up",
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(
              `${BACKEND_URL}wallet/verify-payment`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.status === "success") {
              toast.success("Payment successful");
              setBalance(parseFloat(verifyData.newBalance));
              setAddMoneyAmount("");
              setIsAddMoneyModalOpen(false);
              fetchWalletData();
              pollWalletData();
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            toast.error("Payment verification error");
          }
        },
        theme: { color: "#EF4444" }, // Red color for Razorpay
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();
    } catch (err) {
      toast.error(err.message || "Payment initiation failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const pollWalletData = () => {
    const interval = setInterval(() => {
      fetchWalletData();
    }, 5000);

    setTimeout(() => clearInterval(interval), 30000);
  };

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="text-red-600" size={32} />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchWalletData}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center mx-auto"
          >
            <RefreshCw className="mr-2" size={18} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#10B981",
              color: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            iconTheme: {
              primary: "white",
              secondary: "#10B981",
            },
          },
          error: {
            style: {
              background: "#EF4444",
              color: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            iconTheme: {
              primary: "white",
              secondary: "#EF4444",
            },
          },
        }}
      />

      {/* Add Money Modal */}
      {isAddMoneyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add Money
              </h2>
              <button
                onClick={() => setIsAddMoneyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Enter Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IndianRupee className="text-gray-400" size={20} />
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  className="w-full py-4 pl-12 pr-4 text-xl font-medium border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50 focus:outline-none transition-colors"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex gap-2 mt-4">
                {[500, 1000, 2000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAddMoneyAmount(amount.toString())}
                    className="flex-1 py-2 px-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsAddMoneyModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={initiateRazorpayPayment}
                disabled={isProcessingPayment}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-medium disabled:opacity-70"
              >
                {isProcessingPayment ? (
                  <RefreshCw className="animate-spin mx-auto" size={20} />
                ) : (
                  "Proceed to Pay"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {/* Balance Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 transform transition-all hover:shadow-2xl">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                  <WalletIcon className="text-white" size={24} />
                </div>
                <h2 className="text-xl font-semibold">My Wallet</h2>
              </div>
              {isLoading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <button
                  onClick={fetchWalletData}
                  className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
            <p className="text-white text-opacity-80 mb-2 font-medium">
              Available Balance
            </p>
            <div className="flex items-center">
              <IndianRupee className="mr-1" size={28} />
              <span className="text-5xl font-bold tracking-tight">
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6">
            <button
              onClick={() => setIsAddMoneyModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl hover:from-red-100 hover:to-red-200 transition-all duration-300 border border-gray-200"
            >
              <CreditCard className="text-red-500" size={24} />
              <span className="font-medium text-gray-800">Add Money</span>
            </button>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Recent Transactions
              </h3>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  Last updated {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {isLoading && transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <RefreshCw className="animate-spin text-gray-400" size={24} />
                </div>
                <p className="text-gray-500">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <CreditCard className="text-gray-400" size={24} />
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  No transactions yet
                </h4>
                <p className="text-gray-500 text-center max-w-xs">
                  Add money to your wallet to get started with transactions
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        {renderTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-gray-800 mb-1">
                            {transaction.description || "Transaction"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`
                          text-lg font-semibold
                          ${
                            transaction.type === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        `}
                      >
                        {transaction.type === "credit" ? "+" : "-"}₹
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>

                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
