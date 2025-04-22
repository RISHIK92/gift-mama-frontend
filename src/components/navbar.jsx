import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapPin, ShoppingCart, ChevronDown, MapPinned, CircleUserRound, Wallet, ShoppingBag, Edit, Menu, X, Home, ChevronRight, BadgeIcon, Heart } from 'lucide-react';
import { Search } from "./search";
import axios from 'axios';
import { BACKEND_URL } from '../Url';
import { useNavigate } from 'react-router-dom';
import useCategory from '../hooks/useCategory';
import CategoryDropdown from './categoryDropdown';

const ProfileDropdown = ({ navigate, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMobile]);

  // When clicked, we now directly navigate to the profile page
  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="mt-2 space-y-2">
        <p className="font-medium text-gray-500 pl-4 pb-1 border-b">My Account</p>
        <div
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 cursor-pointer"
          onClick={handleProfileClick}
        >
          <div className="text-red-500 mr-3"><CircleUserRound className="h-5 w-5" /></div>
          My Profile
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={handleProfileClick} className="cursor-pointer">
        <CircleUserRound className='h-8 w-8 text-gray-500 ml-4' />
      </div>
    </div>
  );
};

const MobileMenu = ({ token, navigate, setNavCategory, categories, location, setShowLocationModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  
  const closeMenu = () => {
    setIsOpen(false);
    setShowCategories(false);
  };

  return (
    <div className="lg:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 focus:outline-none"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="bg-white w-4/5 max-w-sm h-full overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
            <div className="flex-none" onClick={() => {navigate('/home'); setNavCategory('Home'); closeMenu();}}>
            <img 
              src="https://res.cloudinary.com/dvweoxpun/image/upload/v1740154234/photomama1_chtuu9.png" 
              alt="Logo" 
              className="h-10 w-28 object-contain"
            />
          </div>
              <button onClick={closeMenu}>
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-4">
              <div 
                className="flex items-center mb-4 p-2 bg-red-50 rounded-lg border border-red-200"
                onClick={() => {setShowLocationModal(true); closeMenu();}}
              >
                <MapPin className="h-5 w-5 text-red-500" />
                <div className="ml-2">
                  <p className="text-xs text-red-400">Deliver to</p>
                  <p className="text-sm font-medium">{location.city || "Select Location"}, {location.pincode}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div 
                  className="flex justify-between items-center p-3 border-b"
                  onClick={() => {navigate('/home'); setNavCategory('Home'); closeMenu();}}
                >
                  <div className="flex items-center">
                    <Home className="h-5 w-5 text-red-500 mr-3" />
                    <span className="font-medium">Home</span>
                  </div>
                </div>
                
                <div 
                  className="flex justify-between items-center p-3 border-b"
                  onClick={() => {navigate('/all'); setNavCategory('All Products'); closeMenu();}}
                >
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-red-500 mr-3" />
                    <span className="font-medium">All Products</span>
                  </div>
                </div>
                
                <div 
                  className="flex justify-between items-center p-3 border-b"
                  onClick={() => setShowCategories(!showCategories)}
                >
                  <span className="font-medium">Categories</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${showCategories ? 'transform rotate-180' : ''}`} />
                </div>
                
                {showCategories && (
                  <div className="ml-4 space-y-2 mb-2">
                    {categories.map((cat) => (
                      <div 
                        key={cat.id}
                        className="flex items-center p-2 hover:bg-red-50 rounded-md cursor-pointer"
                        onClick={() => {
                          navigate(`/category/${cat.category}`);
                          setNavCategory(cat.category);
                          closeMenu();
                        }}
                      >
                        <ChevronRight className="h-4 w-4 text-red-500 mr-2" />
                        <span>{cat.category}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div 
                  className="flex justify-between items-center p-3 border-b ml-auto"
                  onClick={() => {navigate('/cart'); closeMenu();}}
                >
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-red-500 mr-3" />
                    <span className="font-medium">Cart</span>
                  </div>
                </div>
              </div>
              
              {token ? (
                <ProfileDropdown navigate={(path) => {navigate(path); closeMenu();}} isMobile={true} />
              ) : (
                <div 
                  className="mt-4 bg-red-500 text-white rounded-lg py-2 text-center cursor-pointer"
                  onClick={() => {navigate('/signin'); closeMenu();}}
                >
                  Login / Register
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1" onClick={closeMenu}></div>
        </div>
      )}
    </div>
  );
};

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
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-xs sm:max-w-sm md:max-w-md shadow-xl mx-4">
        <h3 className="text-lg font-medium mb-4">Update Your Location</h3>
        
        {!showManualInputs ? (
          <div className="space-y-4">
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

  useEffect(() => {
    fetchCartItems();

    window.addEventListener('cartUpdated', fetchCartItems);
    
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

  const updateCart = () => {
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="flex h-16 lg:h-20 items-center border-b px-4 lg:px-0">
        <MobileMenu 
          token={token} 
          navigate={navigate} 
          setNavCategory={setNavCategory} 
          categories={sortedCategories}
          location={location}
          setShowLocationModal={setShowLocationModal}
        />

        <div className="ml-2 lg:ml-16 cursor-pointer flex-none" onClick={() => {navigate('/home'); setNavCategory('Home');}}>
          <img 
            src="https://res.cloudinary.com/dvweoxpun/image/upload/v1740154234/photomama1_chtuu9.png" 
            alt="Logo" 
            className="h-10 w-28 pt-2 lg:pt-0 lg:h-[3.28rem] lg:w-36 object-contain" 
            style={{ minWidth: '9rem', minHeight: '3.28rem' }}
          />
        </div>


        <div className="hidden lg:block lg:ml-44">
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

        <div className="hidden md:block md:w-64 lg:w-[35rem] ml-4">
          <Search placeholder="Search for Gifts, Categories, Occasions..." setNavCategory={setNavCategory}/>
        </div>

        <div className="flex items-center ml-auto lg:mx-32">
          <div className="relative cursor-pointer pt-1 mr-4 lg:mr-0" onClick={() => navigate('/cart')}>
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </div>
          </div>

          <div className="hidden lg:block">
            {token ? 
              <ProfileDropdown navigate={navigate} />
              : 
              <div className="flex items-center justify-center w-32 h-10 rounded-xl bg-[#FF3B3B] text-white font-thin">
                <p className="text-sm font-extralight cursor-pointer" onClick={() => navigate('/signin')}>Login/Register</p>
              </div>
            }
          </div>
        </div>
      </div>

      <div className="md:hidden px-4 py-2 border-b">
        <Search placeholder="Search..." setNavCategory={setNavCategory}/>
      </div>

      <div className="hidden lg:flex items-center justify-center space-x-6 h-12 border-b">
        <div>
          <CategoryDropdown setNavCategory={setNavCategory} navigate={navigate}/>
        </div>
        <button
          className="px-4 py-2 text-gray-600 hover:text-red-500 text-sm font-medium"
          onClick={() => {
            navigate('/all');
            setNavCategory('All Products');
          }}
        >
          All Products
        </button>
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

      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onAllowLocation={handleAllowLocation}
          onManualEntry={handleManualLocation}
        />
      )}
    </div>
  );
};

export const updateCartCount = () => {
  window.dispatchEvent(new Event('cartUpdated'));
};

export default Navbar;