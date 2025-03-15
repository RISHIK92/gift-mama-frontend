import { useState, useEffect } from "react";
import useUser from "../hooks/useUser";
import { Edit } from "lucide-react";

export default function Profile() {
  const { user, loading, error } = useUser();
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        image: user.image || "https://s3-alpha-sig.figma.com/img/add7/4319/a1a4127e57c95a4240021a5a713dc60e?Expires=1742774400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=CF8X9G-mz8bGS2UhsRenXexURqNHILTtKPOBVmP4U2NI6o8ycSb1ZYQmLXh-YkbuX4xJj~riRgqVeMEBSWtkBlvYfDkfrqOSuiqSr70hF7YksVGSs0xWfIsPUTSjPVQk27E7S~60TTL8ypSEO-wkebZejtFAUl5SJCLGoFtfadlKyIbLGkjxUqH1XaONT8Wb1BVPyRQw6vSl3hR4i2jwsdPOC8FYZiwnrKNtTv6Gzz~MicV7DhgHaCW5k7WQ5KLUo~zUIuthFVpD5O6rkAfbGxNbHj--T30vnDaSDbfMEhr0~~s6mCbiGtGyfWFqLB-Cvsz-UYyR2HyqLAl0Srwjpg__",
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
    <div className="min-h-screen mx-60 p-6">
      <div className="mb-52">
        <div className="absolute left-40">
          <h2 className="text-2xl font-medium mb-4 italic mt-4">Your Profile</h2>
          <div className="flex flex-col items-center">
            <div className="w-44 h-44 rounded-full bg-gray-300 flex items-center justify-center">
              <img src={formData.image} className="h-full w-full rounded-full" alt="Profile" />
            </div>
            <button className="text-red-500 text-sm mt-2">Change Profile</button>
          </div>
        </div>
        <div className="flex gap-6 mx-40">
          <div className="w-full mt-8">
            <button onClick={isEditing ? handleSave : handleEditToggle} className="relative flex items-center justify-between right-0 bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600">
                {isEditing ? "Save" : <Edit />}
            </button>
            <div className="font-semibold text-sm mb-4 mt-3 text-gray-800">General Information</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-gray-700">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-gray-700">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-700">Primary Contact Number</label>
                <input type="text" name="primaryContact" value={formData.primaryContact} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-gray-700">WhatsApp Number</label>
                <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="Enter WhatsApp number" className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <input type="checkbox" className="mr-2" checked={formData.usePrimaryForWhatsApp} disabled />
              <label className="text-gray-700">Use Primary Contact for WhatsApp</label>
            </div>
            <div className="mt-6 font-semibold text-sm mb-3 text-gray-800">Primary Address</div>
            <div className="mt-2">
              <label className="block text-gray-700">Address Line 1</label>
              <input type="text" name="address1" value={formData.address1} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
            </div>
            <div className="mt-2">
              <label className="block text-gray-700">Address Line 2</label>
              <input type="text" name="address2" value={formData.address2} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-gray-700">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-gray-700">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-gray-700">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
              </div>
              <div>
                <label className="block text-gray-700">Pin Code</label>
                <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} className="w-full border-gray-300 rounded-xl bg-gray-200 p-2 mt-1" disabled={!isEditing} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
