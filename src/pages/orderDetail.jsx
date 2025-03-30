import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../Url';

export const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order details');
      }
      
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Error toast notification
  const ErrorToast = ({ message }) => (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-bounce">
      <AlertCircle className="mr-2 h-5 w-5" />
      <span>{message}</span>
    </div>
  );

  // Order Detail Skeleton for loading state
  const OrderDetailSkeleton = () => (
    <div className="p-4 max-w-6xl mx-auto animate-pulse">
      <div className="flex items-center mb-6">
        <div className="h-8 w-8 bg-gray-300 rounded-full mr-4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center">
                  <div className="w-20 h-20 bg-gray-300 rounded-md mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="h-5 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render order status badge
  const renderStatusBadge = (status) => {
    const statusColors = {
      'delivered': 'bg-green-100 text-green-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs uppercase ${statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (error) {
    return <ErrorToast message={error} />;
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-lg mb-4">Order not found</p>
        <button 
          onClick={() => navigate('/orders')}
          className="bg-red-500 text-white px-6 py-2 rounded-lg"
        >
          Back to Order History
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/orders')} 
          className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-medium flex items-center italic">
          <span className="text-red-500 mr-2"><Package /></span> 
          Order Details
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Order Items Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Order Items</h2>
              <div>
                <p className="text-sm text-gray-500">Order #{order.id}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            {order.orderItems.map(item => (
              <div key={item.id} className="flex items-center mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                <img 
                  src={item.product.images[0]?.mainImage || "/placeholder-image.jpg"} 
                  alt={item.product.name} 
                  className="w-24 h-24 object-cover rounded-md mr-4 cursor-pointer"
                  onClick={() => navigate(`/product/${item.product.name}`)}
                />
                <div className="flex-1 cursor-pointer" onClick={() => navigate(`/product/${item.product.name}`)}>
                  <h3 className="font-medium text-md">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-500">Price: ₹{item.product.price}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{item.quantity * item.product.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Tracking Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Order Tracking</h2>
            <div className="relative pl-8 border-l-2 border-gray-200">
              {/* Tracking steps would be dynamically rendered based on order status */}
              <div className="mb-4 relative">
                <div className="absolute left-[-9px] top-0 w-4 h-4 bg-red-500 rounded-full"></div>
                <p className="font-medium">Order Placed</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              {/* Add more tracking steps dynamically */}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Summary Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{order.summary.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>₹{order.summary.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>₹{order.summary.tax}</span>
              </div>
              <div className="flex justify-between font-bold text-red-500 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{order.summary.total + order.summary.deliveryFee + order.summary.tax}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Shipping Information</h2>
            <div className="space-y-2">
              <p className="text-sm"><strong>Status:</strong> {renderStatusBadge(order.status)}</p>
              <p className="text-sm"><strong>Shipping Method:</strong> Standard Shipping</p>
              {/* <p className="text-sm"><strong>Estimated Delivery:</strong> {new Date(order.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;