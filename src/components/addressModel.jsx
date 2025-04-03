import React, { useState, useEffect } from 'react';
import { X, Plus, Check, MapPin, Loader } from 'lucide-react';
import { BACKEND_URL } from '../Url';

const AddressModal = ({ isOpen, onClose, onAddressSelect }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${BACKEND_URL}user/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch addresses');
      }
      
      setAddresses(data);
      
      // Select the default address if available
      if (data.length > 0 && data.some(addr => addr.isDefault)) {
        const defaultAddress = data.find(addr => addr.isDefault);
        setSelectedAddressId(defaultAddress.id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveNewAddress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate the new address
      const requiredFields = ['name', 'line1', 'city', 'state', 'postalCode', 'phone'];
      for (const field of requiredFields) {
        if (!newAddress[field]?.trim()) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`);
        }
      }
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${BACKEND_URL}user/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save address');
      }
      
      // Refresh addresses
      fetchAddresses();
      setIsAddingNew(false);
      
      // Reset the form
      setNewAddress({
        name: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: ''
      });
    } catch (error) {
      console.error('Error saving address:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmAddressSelection = () => {
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
      onClose();
    } else {
      setError('Please select an address');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Select Delivery Address</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="h-8 w-8 text-red-500 animate-spin" />
            </div>
          ) : isAddingNew ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newAddress.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  name="line1"
                  value={newAddress.line1}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="House/Flat No., Building Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  name="line2"
                  value={newAddress.line2}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Street, Landmark"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={newAddress.postalCode}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={newAddress.country}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Country"
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={newAddress.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">You don't have any saved addresses</p>
              <button
                onClick={() => setIsAddingNew(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center justify-center mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(address => (
                <div 
                  key={address.id} 
                  className={`border ${selectedAddressId === address.id ? 'border-red-500' : 'border-gray-300'} 
                    rounded-lg p-3 cursor-pointer hover:border-red-500 transition-colors relative`}
                  onClick={() => setSelectedAddressId(address.id)}
                >
                  {selectedAddressId === address.id && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{address.name}</p>
                      <p className="text-sm">{address.line1}</p>
                      {address.line2 && <p className="text-sm">{address.line2}</p>}
                      <p className="text-sm">
                        {address.city}, {address.state}, {address.postalCode}
                      </p>
                      <p className="text-sm">{address.country}</p>
                      <p className="text-sm mt-1">{address.phone}</p>
                      {address.isDefault && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded mt-2">
                          Default Address
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center justify-center w-full border border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:text-red-500 hover:border-red-500 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Address
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between">
          {isAddingNew ? (
            <>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-gray-500 px-4 py-2 rounded-md"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={saveNewAddress}
                className="bg-red-500 text-white px-6 py-2 rounded-md flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Address'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="text-gray-500 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddressSelection}
                className="bg-red-500 text-white px-6 py-2 rounded-md"
                disabled={!selectedAddressId}
              >
                Deliver Here
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressModal;