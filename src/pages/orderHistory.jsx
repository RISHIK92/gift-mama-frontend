import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../Url';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order history');
      }
      
      setOrders(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Error toast notification
  const ErrorToast = ({ message }) => (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
      <AlertCircle className="mr-2 h-5 w-5" />
      <span>{message}</span>
    </div>
  );

  const OrderItemSkeleton = () => (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 animate-pulse">
      <div className="h-5 bg-gray-300 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
      <div className="flex items-center mt-2">
        <div className="w-12 h-12 bg-gray-300 rounded-md mr-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
  );

  // Render payment status badge
  const renderPaymentStatusBadge = (status) => {
    const statusColors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs uppercase ${statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Render delivery status badge
  const renderDeliveryStatusBadge = (status) => {
    const deliveryStatusColors = {
      'ordered': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs uppercase ${deliveryStatusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const navigateToOrderDetail = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-medium flex items-center mb-6">
          <span className="text-red-500 mr-2"><ClipboardList /></span> Order History
        </h1>
        {[1, 2, 3].map(i => <OrderItemSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <>
      {error && <ErrorToast message={error} />}
      
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-medium flex items-center mb-6">
          <span className="text-red-500 mr-2"><ClipboardList /></span> Order History
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg mb-4">No orders found</p>
            <button 
              onClick={() => navigate('/all')}
              className="bg-red-500 text-white px-6 py-2 rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (order.status === "PAID" &&
              <div 
                key={order.id} 
                className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigateToOrderDetail(order.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold text-red-500">{order.currency} {parseInt(order.summary.total) + parseInt(order.summary.deliveryFee) + parseInt(order.summary.tax)}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {renderPaymentStatusBadge(order.status)}
                  {renderDeliveryStatusBadge(order.delivery)}
                </div>
                
                {/* Show first item preview */}
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <div className="flex items-center">
                      <img 
                        src={order.orderItems[0].product.images[0]?.mainImage || "/placeholder-image.jpg"} 
                        alt={order.orderItems[0].product.name} 
                        className="w-12 h-12 object-cover rounded-md mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium">{order.orderItems[0].product.name}</p>
                        {order.orderItems.length > 1 && (
                          <p className="text-xs text-gray-500">+{order.orderItems.length - 1} more items</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};