import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShoppingCart, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { BACKEND_URL } from '../Url';
import AddressModal from '../components/addressModel';
import CouponRecommendations from '../utils/couponRecommendation';

export const Cart = () => {
  const [cart, setCart] = useState({ items: [], summary: { subtotal: 0, discount: 0, total: 0, deliveryFee: 200, tax: 0 } });
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    type: null,
    itemId: null
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const navigate = useNavigate();
  
  // Calculate the final amount considering wallet balance
  const calculateFinalAmount = () => {
    const cartTotal = cart.summary.total + cart.summary.deliveryFee + cart.summary.tax;
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
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}user/default-address`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 404) {
        // No default address found, that's okay
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch default address');
      }
      
      const data = await response.json();
      setSelectedAddress(data);
    } catch (error) {
      console.error('Error fetching default address:', error);
      // We don't want to show an error for this
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch wallet balance');
      }
      
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setError(error.message);
    }
  };

const fetchAppliedCoupon = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    const response = await fetch(`${BACKEND_URL}cart/coupon`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 404) {
      setAppliedCoupon(null);
      return;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch applied coupon');
    }
    
    const data = await response.json();
    setAppliedCoupon(data.coupon);
  } catch (error) {
    console.error('Error fetching applied coupon:', error);
  }
};
  
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }
      
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const updateQuantity = async (e, itemId, newQuantity) => {
    e.stopPropagation();
    
    try {
      setActionLoading({ type: 'update', itemId });
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}cart/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update quantity');
      }

      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      }));
      
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(`Failed to update quantity: ${error.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading({ type: null, itemId: null });
    }
  };
  
  const removeItem = async (e, itemId) => {
    e.stopPropagation();
    
    try {
      setActionLoading({ type: 'remove', itemId });
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}cart/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove item');
      }
      
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item.id !== itemId)
      }));
      
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      setError(`Failed to remove item: ${error.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading({ type: null, itemId: null });
    }
  };

  const handleApplyCouponFromRecommendation = async (code) => {
    if (!code) {
      // Handle coupon removal
      try {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${BACKEND_URL}cart/coupon`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to remove coupon');
        }
        
        setAppliedCoupon(null);
        fetchCart();
      } catch (error) {
        console.error('Error removing coupon:', error);
        setError(`Failed to remove coupon: ${error.message}`);
        setTimeout(() => setError(null), 3000);
      }
      return;
    }
    
    // Apply the coupon code
    try {
      setCouponError(null);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}cart/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid coupon code');
      }
      
      setAppliedCoupon(data.coupon);
      fetchCart();
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error.message);
      setTimeout(() => setCouponError(null), 3000);
    }
  };
  
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      setActionLoading({ type: 'apply', itemId: null });
      setCouponError(null);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}cart/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: couponCode })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid coupon code');
      }
      
      setAppliedCoupon(data.coupon);
      
      fetchCart();
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
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

  const initializeRazorpayCheckout = async () => {
    try {
      if (!selectedAddress) {
        setError('Please select a delivery address');
        return;
      }
      
      const token = localStorage.getItem('authToken');
      const finalAmount = calculateFinalAmount();
      
      const response = await fetch(`${BACKEND_URL}create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          useWallet: useWallet,
          walletAmount: useWallet ? Math.min(walletBalance, cart.summary.total + cart.summary.deliveryFee + cart.summary.tax) : 0,
          shippingAddress: {
            name: selectedAddress.name,
            line1: selectedAddress.line1,
            line2: selectedAddress.line2 || '',
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country,
            phone: selectedAddress.phone
          },
          notes: `Order placed on ${new Date().toLocaleString()}` // Send as string instead of object
        })
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const options = {
        key: "rzp_test_IiBhDWqxB82lQj",
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'Your Company Name',
        description: 'Cart Checkout',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${BACKEND_URL}verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                useWallet: useWallet,
                walletAmount: useWallet ? Math.min(walletBalance, cart.summary.total + cart.summary.deliveryFee + cart.summary.tax) : 0
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.status === 'success') {
              navigate('/order-confirmation');
            } else {
              setError('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Failed to verify payment');
          }
        },
        prefill: {
          name: selectedAddress.name,
          email: 'customer@example.com',
          contact: selectedAddress.phone
        },
        notes: {
          address: `${selectedAddress.line1}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.postalCode}`
        },
        theme: {
          color: '#FF2A2A'
        }
      };

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        setError('Failed to load payment gateway');
      };
      document.body.appendChild(script);

    } catch (error) {
      console.error('Checkout error:', error);
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
      setError('Your cart is empty');
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
  
  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-medium flex items-center mb-6 italic">
          <span className="text-red-500 mr-2"><ShoppingCart /></span> Your Cart
        </h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {[1, 2, 3].map(i => <CartItemSkeleton key={i} />)}
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
      
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-medium flex items-center mb-6 italic">
          <span className="text-red-500 mr-2"><ShoppingCart /></span> Your Cart
        </h1>
        
        {cart.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Your cart is empty</p>
            <button 
              onClick={() => navigate('/all')}
              className="bg-red-500 text-white px-6 py-2 rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {cart.items.map(item => {
                const product = item.product;
                const price = Number(product.price);
                const discountedPrice = product.discountedPrice ? Number(product.discountedPrice) : price;
                const itemTotal = discountedPrice * item.quantity;
                const itemDiscount = (price - discountedPrice) * item.quantity;
                const isUpdating = actionLoading.type === 'update' && actionLoading.itemId === item.id;
                const isRemoving = actionLoading.type === 'remove' && actionLoading.itemId === item.id;
                
                return (
                  <div key={item.id} className={`flex mb-6 pb-4 border-b border-gray-200 ${isRemoving ? 'opacity-50 animate-pulse' : ''}`}>
                    <div 
                      className="w-[140px] h-[140px] rounded-md bg-gray-200 overflow-hidden mr-3 cursor-pointer"
                      onClick={() => navigateToProduct(product.name)}
                    >
                      <img 
                        src={product.images[0]?.mainImage || product.images[0]?.displayImage || ""} 
                        className="w-full h-full object-cover" 
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
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
                            onClick={(e) => updateQuantity(e, item.id, item.quantity + 1)}
                            disabled={isUpdating}
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
                      
                      <div className="mt-3 flex justify-end">
                        <button 
                          onClick={(e) => removeItem(e, item.id)}
                          className="text-red-500 text-sm flex items-center"
                          disabled={isRemoving}
                        >
                          {isRemoving ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
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
              
              <div className="mt-4 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <input 
                      type="text" 
                      placeholder="Enter coupon code" 
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </div>
                  <button 
                    className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center"
                    onClick={applyCoupon}
                    disabled={actionLoading.type === 'apply' || !couponCode.trim()}
                  >
                    {actionLoading.type === 'apply' ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : 'Apply Coupon'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-80">
              <div className="border border-gray-200 rounded-lg">
                {selectedAddress ? (
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">Delivery Address</h3>
                      <button 
                        onClick={() => setIsAddressModalOpen(true)}
                        className="text-red-500 text-sm"
                      >
                        Change
                      </button>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{selectedAddress.name}</p>
                        <p className="text-sm text-gray-600">
                          {selectedAddress.line1}
                          {selectedAddress.line2 && `, ${selectedAddress.line2}`}
                          {`, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.postalCode}`}
                        </p>
                        <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-b border-gray-200">
                    <button 
                      onClick={() => setIsAddressModalOpen(true)}
                      className="w-full bg-gray-100 text-gray-800 font-medium p-3 rounded-md flex items-center justify-center"
                    >
                      <MapPin className="h-5 w-5 mr-2" />
                      Add Delivery Address
                    </button>
                  </div>
                )}

              <CouponRecommendations
                    onApplyCoupon={handleApplyCouponFromRecommendation}
                    currentCartTotal={cart.summary.subtotal}
                    appliedCoupon={appliedCoupon}
                  />
                
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-3">Order Summary</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal ({cart.items.length} items)</span>
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
                    {cart.summary.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{cart.summary.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>₹{(cart.summary.total + cart.summary.deliveryFee + cart.summary.tax).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {walletBalance > 0 && (
                    <div className="mb-4 p-3 bg-gray-100 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="useWallet" 
                            checked={useWallet}
                            onChange={() => setUseWallet(!useWallet)}
                            className="mr-2"
                          />
                          <label htmlFor="useWallet" className="text-sm">Use Wallet Balance</label>
                        </div>
                        <span className="text-sm font-medium">₹{walletBalance.toFixed(2)}</span>
                      </div>
                      {useWallet && (
                        <div className="text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Amount to be paid</span>
                            <span className="font-medium">₹{calculateFinalAmount().toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-red-500 text-white py-3 rounded-md font-medium flex items-center justify-center"
                    disabled={cart.items.length === 0 || checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};