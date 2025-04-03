import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, RefreshCw, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../Url';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
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
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-bounce">
      <AlertCircle className="mr-2 h-5 w-5" />
      <span>{message}</span>
    </div>
  );

  const OrderItemSkeleton = () => (
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

  // Filter orders based on status
  const filterOrders = (status) => {
    setActiveFilter(status);
  };

  // Get filtered orders
  const getFilteredOrders = () => {
    if (activeFilter === 'all') return orders;
    return orders.filter(order => order.status.toLowerCase() === activeFilter);
  };

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

  const navigateToOrderDetail = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-medium flex items-center mb-6 italic">
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
        <h1 className="text-2xl font-medium flex items-center mb-6 italic">
          <span className="text-red-500 mr-2"><ClipboardList /></span> Order History
        </h1>

        {getFilteredOrders().length === 0 ? (
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
          <div className="space-y-6">
            {getFilteredOrders().map(order => (order.status==="PAID" &&
              <div 
                key={order.id} 
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigateToOrderDetail(order.id)}
              >
                {console.log(order)}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  {renderStatusBadge(order.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">Items</h3>
                    {order.orderItems.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center mb-2">
                        <img 
                          src={item.product.images[0]?.mainImage || "/placeholder-image.jpg"} 
                          alt={item.product.name} 
                          className="w-20 h-20 object-cover rounded-md mr-2"
                        />
                        <div>
                          <p className="text-sm font-medium">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2">Order Summary</h3>
                    <div className="space-y-1">
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
                      <div className="flex justify-between font-bold text-red-500">
                        <span>Total</span>
                        <span>₹{order.summary.total + order.summary.deliveryFee + order.summary.tax}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};