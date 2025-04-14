import { useState, useEffect } from "react";
import useUser from "../hooks/useUser";
import { Edit, Save, ChevronRight } from "lucide-react";

export default function Profile() {
  const { user, loading, error } = useUser();
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        primaryContact: user.phone || "",
        whatsappNumber: user.whatsappNumber || "",
        usePrimaryForWhatsApp: user.usePrimaryForWhatsApp || false,
        address1: user.address1 || "",
        address2: user.address2 || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        pinCode: user.pinCode || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:3000/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!formData) return null;

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto">
      <div className="w-full mb-12">
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header with title and edit button */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-800">Profile Information</h2>
              <button 
                onClick={isEditing ? handleSave : handleEditToggle} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
                  isEditing 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isEditing ? (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="space-y-6">
                {/* General Information Section */}
                <div>
                  <div className="font-medium text-sm mb-4 text-red-800 border-b border-red-100 pb-2 flex items-center">
                    <span>General Information</span>
                    <ChevronRight size={16} className="ml-1 text-red-600" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">First Name</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                      disabled={!isEditing} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Primary Contact Number</label>
                      <input 
                        type="text" 
                        name="primaryContact" 
                        value={formData.primaryContact} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">WhatsApp Number</label>
                      <input 
                        type="text" 
                        name="whatsappNumber" 
                        value={formData.whatsappNumber} 
                        onChange={handleChange} 
                        placeholder="Enter WhatsApp number" 
                        className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <input 
                      type="checkbox" 
                      name="usePrimaryForWhatsApp"
                      checked={formData.usePrimaryForWhatsApp} 
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 disabled:opacity-75" 
                      disabled={!isEditing} 
                    />
                    <label className="text-sm text-gray-600">Use Primary Contact for WhatsApp</label>
                  </div>
                </div>
                
                {/* Address Section */}
                <div>
                  <div className="font-medium text-sm mb-4 text-red-800 border-b border-red-100 pb-2 flex items-center">
                    <span>Primary Address</span>
                    <ChevronRight size={16} className="ml-1 text-red-600" />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-1">Address Line 1</label>
                    <input 
                      type="text" 
                      name="address1" 
                      value={formData.address1} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                      disabled={!isEditing} 
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm text-gray-600 mb-1">Address Line 2</label>
                    <input 
                      type="text" 
                      name="address2" 
                      value={formData.address2} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                      disabled={!isEditing} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">City</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">State</label>
                      <input 
                        type="text" 
                        name="state" 
                        value={formData.state} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Country</label>
                      <input 
                        type="text" 
                        name="country" 
                        value={formData.country} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Pin Code</label>
                      <input 
                        type="text" 
                        name="pinCode" 
                        value={formData.pinCode} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-md bg-gray-50 p-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-700" 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Conditional floating save button when in edit mode */}
            {isEditing && (
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-md flex justify-end">
                <button 
                  onClick={handleSave}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}