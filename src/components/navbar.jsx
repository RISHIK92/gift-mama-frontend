import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapPin, ShoppingCart, ChevronDown, CircleUserRound, MapPinned } from 'lucide-react';
import { Search } from "./search";
import axios from 'axios';
import { BACKEND_URL } from '../Url';
import { useNavigate } from 'react-router-dom';
import useCategory from '../hooks/useCategory';
import CategoryDropdown from './categoryDropdown';

const LocationModal = ({ onClose, onAllowLocation, onManualEntry }) => {
  const [showManualInputs, setShowManualInputs] = useState(false);
  const [manualLocation, setManualLocation] = useState({ city: "", pincode: "" });
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const fetchCityByPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return;
    }
    
    setIsLoadingCity(true);
    setError("");
    
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        setManualLocation({
          city: postOffice.District,
          pincode: pincode
        });
      } else {
        setError("Invalid pincode. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching city by pincode:", error);
      setError("Failed to fetch city. Please enter manually.");
    } finally {
      setIsLoadingCity(false);
    }
  };

  const handlePincodeChange = (e) => {
    const newPincode = e.target.value;
    setManualLocation({ ...manualLocation, pincode: newPincode });
    
    if (newPincode.length === 6) {
      fetchCityByPincode(newPincode);
    }
  };

  const handleManualSubmit = () => {
    if (!manualLocation.city || !manualLocation.pincode) {
      setError("Please enter both city and pincode");
      return;
    }
    onManualEntry(manualLocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-lg font-medium mb-4">Update Your Location</h3>
        
        {!showManualInputs ? (
          <div className="space-y-4">
            <button 
              onClick={onAllowLocation}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              <MapPinned className="h-4 w-4" />
              Allow Location Access
            </button>
            
            <div className="flex items-center">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            <button 
              onClick={() => setShowManualInputs(true)}
              className="w-full border border-red-500 text-red-500 py-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              Enter Manually
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Pincode"
                value={manualLocation.pincode}
                onChange={handlePincodeChange}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                maxLength={6}
              />
              {isLoadingCity && <p className="text-sm text-gray-500 mt-1">Finding city...</p>}
            </div>
            
            <input
              type="text"
              placeholder="City"
              value={manualLocation.city}
              onChange={(e) => setManualLocation({ ...manualLocation, city: e.target.value })}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowManualInputs(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleManualSubmit}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                disabled={isLoadingCity}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Navbar = ({setNavCategory}) => {
  const token = localStorage.getItem('authToken');
  const [location, setLocation] = useState({ city: "", pincode: "" });
  const {category, loading, error} = useCategory();
  const sortedCategories = [...(category || [])].sort((a, b) => a.id - b.id);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [city, setCity] = useState("");

  // Create a function to fetch cart items that can be called multiple times
  const fetchCartItems = useCallback(async () => {
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartCount(response.data.items?.length || 0);
    } catch (error) {
      console.log("Error fetching cart items:", error);
      setCartCount(0);
    }
  }, [token]);

  // Initial cart fetch
  useEffect(() => {
    fetchCartItems();

    // Set up event listener for cart updates
    window.addEventListener('cartUpdated', fetchCartItems);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('cartUpdated', fetchCartItems);
    };
  }, [fetchCartItems]);

  const fetchLocation = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const address = response.data.address;
      setLocation({
        city: address.city || address.town || address.village || "Unknown",
        pincode: address.postcode || "N/A",
      });
    } catch (error) {
      console.error("Error fetching location data:", error);
      setLocationPermissionDenied(true);
    }
  };

  const handleAllowLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchLocation(position.coords.latitude, position.coords.longitude);
          setLocationPermissionDenied(false);
          setShowLocationModal(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationPermissionDenied(true);
        }
      );
    }
  };

  const handleManualLocation = (manualLocation) => {
    setLocation(manualLocation);
    setLocationPermissionDenied(false);
  };

  useEffect(() => {
    handleAllowLocation();
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await axios.get(`${BACKEND_URL}user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCity(response.data.city);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    if (token) {
      fetchUser();
    }
  }, [token]);

  // Function to dispatch cart updated event (for use in other components)
  const updateCart = () => {
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="flex h-20 items-center border-b">
        <div className="ml-16 cursor-pointer" onClick={() => {navigate('/home'); setNavCategory('Home');}}>
          <img src="https://res.cloudinary.com/dvweoxpun/image/upload/v1740154234/photomama1_chtuu9.png" alt="Logo" className="h-13 w-36" />
        </div>
        <div className="ml-44">
          <div className="bg-red-50 flex items-center h-12 w-48 rounded-xl border border-red-200 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setShowLocationModal(true)} >
            <MapPin className="h-5 w-5 text-red-500 ml-4" />
            <div className="flex flex-col justify-center">
              <p className="text-xs text-red-400 leading-none ml-3">Deliver to</p>
              <p className="font-medium text-black mt-0.5 ml-3 flex items-center text-xs">
                {location.city || "Select Location"}, 
                <span className="font-medium text-xs">{location.pincode}</span>
              </p>
            </div>
          </div>
        </div>

        {showLocationModal && (
          <LocationModal
            onClose={() => setShowLocationModal(false)}
            onAllowLocation={handleAllowLocation}
            onManualEntry={handleManualLocation}
          />
        )}

        <div className="w-[35rem] ml-4">
          <Search placeholder="Search for Gifts, Categories, Occasions..." setNavCategory={setNavCategory}/>
        </div>
        <div className="ml-32 relative cursor-pointer" onClick={() => navigate('/cart')}>
          <ShoppingCart className="h-6 w-6 text-gray-700" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {cartCount}
          </div>
        </div>
        {token ? 
          <div onClick={() => navigate('/profile')}>
            <CircleUserRound className='h-8 w-8 text-gray-500 ml-4 cursor-pointer'/>
          </div>
          : 
          <div className="flex items-center justify-center w-32 h-10 rounded-xl bg-[#FF3B3B] text-white font-thin ml-8">
            <p className="text-sm font-extralight cursor-pointer" onClick={() => navigate('/signin')}>Login/Register</p>
          </div>
        }
      </div>
      <div className="flex items-center justify-center space-x-6 h-12 border-b">
        <div>
          <CategoryDropdown setNavCategory={setNavCategory} navigate={navigate}/>
        </div>
        {sortedCategories.map((e) => (
          <button
            key={e.id}
            className="px-4 py-2 text-gray-600 hover:text-red-500 text-sm font-medium" 
            onClick={() => {
              navigate(`/category/${e.category}`);
              setNavCategory(e.category);
            }}
          >
            {e.category}
          </button>
        ))}
      </div>
    </div>
  );
};

// Export the updateCart function for use in other components
export const updateCartCount = () => {
  window.dispatchEvent(new Event('cartUpdated'));
};

export default Navbar;