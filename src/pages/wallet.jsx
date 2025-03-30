import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard, 
  IndianRupee,
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react';
import { BACKEND_URL } from '../Url';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1
  });

  const formatCurrency = (amount) => {
    const safeAmount = typeof amount === 'number' ? amount : 0;
    return safeAmount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
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
      document.body.removeChild(script);
    };
  }, []); 

  const renderTransactionIcon = (type) => {
    return type === 'credit' 
      ? <ArrowDownRight className="text-green-500 bg-green-50 rounded-full p-1.5 transition-transform group-hover:scale-110" size={28} />
      : <ArrowUpRight className="text-red-500 bg-red-50 rounded-full p-1.5 transition-transform group-hover:scale-110" size={28} />;
  };

  const fetchWalletData = async () => {
    const token = localStorage.getItem('authToken')
    setIsLoading(true);
    setError(null);
    try {
      const [balanceResponse, transactionsResponse] = await Promise.all([
        fetch(`${BACKEND_URL}wallet/balance`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BACKEND_URL}wallet/transactions?page=1&limit=10`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!balanceResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch wallet information');
      }

      const balanceData = await balanceResponse.json();
      const transactionsData = await transactionsResponse.json();

      setBalance(balanceData.balance || 0);
      setTransactions(transactionsData.transactions || []);
      setPagination({
        currentPage: transactionsData.pagination.currentPage,
        totalPages: transactionsData.pagination.totalPages
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch wallet information');
      toast.error(err.message || 'Failed to fetch wallet information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const token = localStorage.getItem('authToken')
    const amount = parseFloat(addMoneyAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}wallet/add-money`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        throw new Error('Failed to add money');
      }

      const data = await response.json();
      setBalance(data.newBalance || 0);
      setAddMoneyAmount('');
      setIsAddMoneyModalOpen(false);
      toast.success('Money added successfully');
      fetchWalletData();
    } catch (err) {
      toast.error(err.message || 'Failed to add money');
    }
  };

  const initiateRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast.error("Razorpay is not loaded. Please refresh the page and try again.");
      return;
    }
  
    const token = localStorage.getItem('authToken');
    const amount = parseFloat(addMoneyAmount);
  
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
  
    try {
      const orderResponse = await fetch(`${BACKEND_URL}wallet/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
  
      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }
  
      const orderData = await orderResponse.json();
  
      const options = {
        key: "rzp_test_IiBhDWqxB82lQj",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Your Company Name",
        description: "Wallet Top-up",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${BACKEND_URL}wallet/verify-payment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
  
            const verifyData = await verifyResponse.json();
  
            if (verifyData.status === 'success') {
              toast.success('Payment successful');
              setBalance(verifyData.newBalance);
              setAddMoneyAmount('');
              setIsAddMoneyModalOpen(false);
              fetchWalletData();
              pollWalletData();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error('Payment verification error');
          }
        },
        theme: { color: "#F37254" }
      };
  
      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();
    } catch (err) {
      toast.error(err.message || 'Payment initiation failed');
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
      <div className="bg-gradient-to-br from-red-50 to-pink-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500 animate-bounce" size={48} />
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <button 
            onClick={fetchWalletData} 
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto"
          >
            <RefreshCw className="mr-2 inline" size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-pink-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#4caf50',
              color: 'white',
              borderRadius: '10px',
            },
          },
          error: {
            style: {
              background: '#f44336',
              color: 'white',
              borderRadius: '10px',
            },
          },
        }}
      />

      {/* Add Money Modal */}
      {isAddMoneyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">Add Money</h2>
              <button 
                onClick={() => setIsAddMoneyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="relative mb-6">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="number" 
                placeholder="Enter amount" 
                value={addMoneyAmount}
                onChange={(e) => setAddMoneyAmount(e.target.value)}
                className="w-full p-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsAddMoneyModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={initiateRazorpayPayment}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        {/* Balance Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 transform transition-all hover:scale-[1.01]">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <WalletIcon className="mr-2" size={28} />
                <h2 className="text-xl font-semibold">My Wallet</h2>
              </div>
              {isLoading && <RefreshCw className="animate-spin" size={20} />}
            </div>
            <p className="text-red-100 mb-2">Available Balance</p>
            <div className="flex items-center">
              <IndianRupee className="mr-1" size={28} />
              <span className="text-5xl font-bold tracking-tight">
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 bg-gradient-to-b from-white to-red-50">
            <button 
              onClick={() => setIsAddMoneyModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border border-red-100"
            >
              <CreditCard className="text-red-500" size={24} />
              <span className="font-medium text-gray-800">Add Money</span>
            </button>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Recent Transactions</h3>
              <button 
                onClick={fetchWalletData}
                disabled={isLoading}
                className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                {isLoading ? 'Refreshing' : 'Refresh'}
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No transactions yet</p>
                <p className="text-sm text-gray-400">Add money to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map(transaction => (
                  transaction && (
                    <div 
                      key={transaction.id} 
                      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        {renderTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-gray-800 mb-1">
                            {transaction.description || 'Transaction'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.createdAt 
                              ? new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'Date Unavailable'
                            }
                          </p>
                        </div>
                      </div>
                      <span className={`
                        text-lg font-semibold transition-all duration-300 group-hover:scale-110
                        ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}
                      `}>
                        {transaction.type === 'credit' ? '+' : '-'} 
                        ₹{transaction.amount ? formatCurrency(transaction.amount) : '0.00'}
                      </span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}