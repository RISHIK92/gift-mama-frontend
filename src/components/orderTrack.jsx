import React from 'react';
import { CheckCircle, Truck, Package, XCircle, Clock } from 'lucide-react';

const OrderTrackingTimeline = ({ order }) => {
  const steps = [
    {
      id: 'ordered',
      label: 'Ordered',
      icon: <Package size={18} />,
      date: order?.createdAt ? new Date(order.createdAt).toLocaleString() : '',
      status: 'completed'
    },
    {
      id: 'shipped',
      label: 'Shipped',
      icon: <Truck size={18} />,
      date: order?.shippedAt ? new Date(order.shippedAt).toLocaleString() : '',
      status: order?.delivery === 'Shipped' || order?.delivery === 'Delivered' ? 'completed' : 'pending'
    },
    {
      id: 'delivered',
      label: 'Delivered',
      icon: <CheckCircle size={18} />,
      date: order?.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : '',
      status: order?.delivery === 'Delivered' ? 'completed' : 'pending'
    }
  ];

  // Handle cancelled orders
  if (order?.delivery === 'Cancelled') {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-full">
            <XCircle size={24} className="text-red-500" />
          </div>
          <div>
            <p className="font-medium text-red-700">Order Cancelled</p>
            <p className="text-sm text-red-600">
              {order?.cancelledAt ? `Cancelled on ${new Date(order.cancelledAt).toLocaleString()}` : 'This order has been cancelled'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        {/* Vertical line connecting all steps */}
        <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200"></div>
        
        {steps.map((step, index) => (
          <div key={step.id} className="relative mb-6">
            <div className="flex items-start">
              {/* Status icon */}
              <div className={`z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 ${
                step.status === 'completed' 
                  ? 'border-green-500 bg-green-50 text-green-500' 
                  : 'border-gray-300 bg-gray-50 text-gray-400'
              }`}>
                {step.status === 'completed' ? step.icon : <Clock size={18} />}
              </div>
              
              {/* Step details */}
              <div className="ml-4">
                <h3 className={`font-semibold ${
                  step.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </h3>
                
                {step.date && (
                  <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                )}
                
                {step.status === 'pending' && (
                  <p className="text-xs text-gray-400 mt-1">Pending</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTrackingTimeline;