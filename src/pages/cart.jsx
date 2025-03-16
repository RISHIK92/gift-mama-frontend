import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { NewlyArrived, productData } from '../components/arrived';
import { ProductCard } from '../components/product';
import { MapPin, ShoppingCart, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { BACKEND_URL } from '../Url';

export const Cart = () => {
  const [cart, setCart] = useState({ items: [], summary: { subtotal: 0, discount: 0, total: 0, deliveryFee: 200, tax: 0 } });
  const [useWallet, setUseWallet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    type: null,
    itemId: null
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCart();
  }, []);
  
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
    // Stop propagation to prevent navigation
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
    // Stop propagation to prevent navigation
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
      
      fetchCart(); // Refresh cart with applied coupon
      setCouponCode(''); // Clear coupon input
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error.message);
      setTimeout(() => setCouponError(null), 3000);
    } finally {
      setActionLoading({ type: null, itemId: null });
    }
  };
  
  const handleCheckout = () => {
    setCheckoutLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setCheckoutLoading(false);
      navigate('/checkout');
    }, 800);
  };
  
  // Navigate to product detail
  const navigateToProduct = (productName) => {
    navigate(`/product/${productName}`);
  };
  
  // Loading skeleton for cart items
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
  
  // Error toast notification
  const ErrorToast = ({ message }) => (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-bounce">
      <AlertCircle className="mr-2 h-5 w-5" />
      <span>{message}</span>
    </div>
  );
  
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
                    {/* Product Image - Clickable */}
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
                      <h3 
                        className="font-bold text-lg cursor-pointer hover:text-red-500 transition-colors"
                        onClick={() => navigateToProduct(product.name)}
                      >
                        {product.name}
                      </h3>
                      
                      <p className="text-red-500 text-sm">
                        {product.categories.join(' / ')}
                      </p>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center border border-gray-300 rounded-full ${isUpdating ? 'border-red-300 animate-pulse' : ''}`}>
                            <button
                              onClick={(e) => updateQuantity(e, item.id, item.quantity - 1)}
                              className="w-8 h-8 flex mb-1 items-center justify-center"
                              disabled={item.quantity <= 1 || isUpdating || isRemoving}
                            >
                              −
                            </button>
                            <span className="w-8 text-center">
                              {isUpdating ? (
                                <RefreshCw className="h-4 w-4 mx-auto animate-spin" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={(e) => updateQuantity(e, item.id, item.quantity + 1)}
                              className="w-8 h-8 flex mb-1 items-center justify-center"
                              disabled={isUpdating || isRemoving}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            className="text-red-500"
                            onClick={(e) => removeItem(e, item.id)}
                            disabled={isUpdating || isRemoving}
                          >
                            {isRemoving ? (
                              <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        <span className="text-red-500 font-bold text-xl">₹{itemTotal}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-₹{cart.summary.discount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery and Handling Fee</span>
                  <span>₹{cart.summary.deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>GSTIN</span>
                  <span>₹{cart.summary.tax}</span>
                </div>
                <div className="flex justify-between font-bold pt-3 border-t border-gray-200">
                  <span>Sub Total</span>
                  <span>₹{cart.summary.total + cart.summary.deliveryFee + cart.summary.tax}</span>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-80">
              <div className="mb-4">
                <div className="flex justify-between mb-4">
                  <span>Sub Total</span>
                  <span className="text-red-500 font-bold">₹{cart.summary.total + cart.summary.deliveryFee + cart.summary.tax}</span>
                </div>
                
                <div className="flex mb-6">
                  <input
                    type="text"
                    placeholder="Have any coupon codes?"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={`flex-1 border ${couponError ? 'border-red-500' : 'border-gray-300'} rounded-l-md px-3 py-2 text-sm`}
                    disabled={actionLoading.type === 'apply'}
                  />
                  <button 
                    className={`bg-white border ${couponError ? 'border-red-500' : 'border-gray-300'} border-l-0 rounded-r-md px-4 text-red-500 font-bold text-sm transition-all`}
                    onClick={applyCoupon}
                    disabled={actionLoading.type === 'apply' || !couponCode.trim()}
                  >
                    {actionLoading.type === 'apply' ? (
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      'APPLY'
                    )}
                  </button>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-md mb-6 relative">
                  <div className="flex">
                    <span className="mr-2"><MapPin /></span>
                    <div>
                      <p className="text-sm">Delivering to EditPointIndia,</p>
                      <p className="text-sm">Door No.A3, Block, Street Number 1,</p>
                      <p className="text-sm">Walker Town,</p>
                      <p className="text-sm">Padmarao Nagar, Secunderabad,</p>
                      <p className="text-sm">Telangana 500025</p>
                    </div>
                  </div>
                  <p className="text-red-500 text-sm mt-2 ml-5 cursor-pointer" onClick={() => navigate('/profile')}>CHANGE ADDRESS</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-4">
                    <span>Wallet Balance</span>
                    <span className="text-red-500 font-bold">₹920</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="wallet"
                      checked={useWallet}
                      onChange={() => setUseWallet(!useWallet)}
                      className="h-4 w-4 text-red-500"
                    />
                    <label htmlFor="wallet" className="text-sm">Credit from wallet?</label>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <button 
                  className={`w-full bg-[#FF2A2A] text-white py-3 rounded-2xl font-light text-sm relative overflow-hidden ${checkoutLoading ? 'cursor-not-allowed' : ''}`}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <span className="opacity-0">Proceed to Payment</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      </div>
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-20 relative left-0"> 
        </div>
      </div>
    </>
  );
};