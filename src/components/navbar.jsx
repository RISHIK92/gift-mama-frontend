import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  MapPin,
  ShoppingCart,
  ChevronDown,
  MapPinned,
  CircleUserRound,
  Wallet,
  ShoppingBag,
  Edit,
  Menu,
  X,
  Home,
  ChevronRight,
  BadgeIcon,
  Heart,
} from "lucide-react";
import { Search } from "./search";
import axios from "axios";
import { BACKEND_URL } from "../Url";
import { useNavigate } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import CategoryDropdown from "./categoryDropdown";

const ProfileDropdown = ({ navigate, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMobile]);

  // When clicked, we now directly navigate to the profile page
  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="mt-2 space-y-2">
        <p className="font-medium text-gray-500 pl-4 pb-1 border-b">
          My Account
        </p>
        <div
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 cursor-pointer"
          onClick={handleProfileClick}
        >
          <div className="text-red-500 mr-3">
            <CircleUserRound className="h-5 w-5" />
          </div>
          My Profile
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={handleProfileClick} className="cursor-pointer">
        <CircleUserRound className="h-8 w-8 text-gray-500 ml-4" />
      </div>
    </div>
  );
};

const MobileMenu = ({
  token,
  navigate,
  setNavCategory,
  categories,
  location,
  setShowLocationModal,
}) => {
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
              <div
                className="flex-none"
                onClick={() => {
                  navigate("/home");
                  setNavCategory("Home");
                  closeMenu();
                }}
              >
                <img
                  src="https://res.cloudinary.com/df622sxkk/image/upload/v1747778280/Group_17_hn00uo.png"
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
                onClick={() => {
                  setShowLocationModal(true);
                  closeMenu();
                }}
              >
                <MapPin className="h-5 w-5 text-red-500" />
                <div className="ml-2">
                  <p className="text-xs text-red-400">Deliver to</p>
                  <p className="text-sm font-medium">
                    {location.city || "Select Location"}, {location.pincode}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className="flex justify-between items-center p-3 border-b"
                  onClick={() => {
                    navigate("/home");
                    setNavCategory("Home");
                    closeMenu();
                  }}
                >
                  <div className="flex items-center">
                    <Home className="h-5 w-5 text-red-500 mr-3" />
                    <span className="font-medium">Home</span>
                  </div>
                </div>

                <div
                  className="flex justify-between items-center p-3 border-b"
                  onClick={() => {
                    navigate("/all");
                    setNavCategory("All Products");
                    closeMenu();
                  }}
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
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      showCategories ? "transform rotate-180" : ""
                    }`}
                  />
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
                  onClick={() => {
                    navigate("/cart");
                    closeMenu();
                  }}
                >
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-red-500 mr-3" />
                    <span className="font-medium">Cart</span>
                  </div>
                </div>
              </div>

              {token ? (
                <ProfileDropdown
                  navigate={(path) => {
                    navigate(path);
                    closeMenu();
                  }}
                  isMobile={true}
                />
              ) : (
                <div
                  className="mt-4 bg-red-500 text-white rounded-lg py-2 text-center cursor-pointer"
                  onClick={() => {
                    navigate("/signin");
                    closeMenu();
                  }}
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
  const [manualLocation, setManualLocation] = useState({
    city: "",
    pincode: "",
  });
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const fetchCityByPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return;
    }

    setIsLoadingCity(true);
    setError("");

    try {
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      if (response.data && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        setManualLocation({
          city: postOffice.District,
          pincode: pincode,
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
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-xs sm:max-w-sm md:max-w-md shadow-xl mx-4"
      >
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
              {isLoadingCity && (
                <p className="text-sm text-gray-500 mt-1">Finding city...</p>
              )}
            </div>

            <input
              type="text"
              placeholder="City"
              value={manualLocation.city}
              onChange={(e) =>
                setManualLocation({ ...manualLocation, city: e.target.value })
              }
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

// Enhanced 3D Sparkle Animation Component
const SparkleEffect = ({ isActive }) => {
  const [sparkles, setSparkles] = useState([]);
  const animationRef = useRef();

  // Generate random sparkle properties
  const generateSparkle = (index) => ({
    id: Math.random(),
    size: Math.random() * 3 + 1, // 1-4px
    color: [
      "#FFD700",
      "#FFA500",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
    ][Math.floor(Math.random() * 7)],
    startX: Math.random() * 60 - 30, // -30 to 30px from center
    startY: Math.random() * 60 - 30,
    endX: (Math.random() - 0.5) * 120, // -60 to 60px
    endY: (Math.random() - 0.5) * 120,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 720, // -360 to 360 degrees per second
    scale: Math.random() * 0.5 + 0.5, // 0.5 to 1
    delay: Math.random() * 0.5, // 0 to 0.5s delay
    duration: Math.random() * 0.8 + 0.8, // 0.8 to 1.6s
    easing: [
      "ease-out",
      "ease-in-out",
      "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    ][Math.floor(Math.random() * 3)],
    zIndex: Math.floor(Math.random() * 10) + 1,
  });

  useEffect(() => {
    if (isActive) {
      // Generate 20 sparkles with different properties
      const newSparkles = Array.from({ length: 20 }, (_, i) =>
        generateSparkle(i)
      );
      setSparkles(newSparkles);

      // Clear sparkles after animation
      const timer = setTimeout(() => {
        setSparkles([]);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setSparkles([]);
    }
  }, [isActive]);

  if (!isActive || sparkles.length === 0) return null;

  const SparkleParticle = ({ sparkle }) => (
    <div
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "50%",
        width: `${sparkle.size}px`,
        height: `${sparkle.size}px`,
        backgroundColor: sparkle.color,
        borderRadius: "50%",
        transform: `translate(-50%, -50%) translate(${sparkle.startX}px, ${sparkle.startY}px) rotate(${sparkle.rotation}deg) scale(${sparkle.scale})`,
        animation: `sparkle-move-${sparkle.id} ${sparkle.duration}s ${sparkle.easing} ${sparkle.delay}s forwards, sparkle-rotate-${sparkle.id} ${sparkle.duration}s linear ${sparkle.delay}s forwards`,
        zIndex: sparkle.zIndex,
        boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}40, 0 0 ${
          sparkle.size * 4
        }px ${sparkle.color}20`,
      }}
    >
      <style jsx>{`
        @keyframes sparkle-move-${sparkle.id} {
          0% {
            transform: translate(-50%, -50%)
              translate(${sparkle.startX}px, ${sparkle.startY}px)
              scale(${sparkle.scale}) rotateZ(${sparkle.rotation}deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translate(-50%, -50%)
              translate(${sparkle.startX}px, ${sparkle.startY}px)
              scale(${sparkle.scale * 1.2})
              rotateZ(${sparkle.rotation + sparkle.rotationSpeed * 0.1}deg);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%)
              translate(
                ${sparkle.startX + (sparkle.endX - sparkle.startX) * 0.5}px,
                ${sparkle.startY + (sparkle.endY - sparkle.startY) * 0.5}px
              )
              scale(${sparkle.scale})
              rotateZ(${sparkle.rotation + sparkle.rotationSpeed * 0.5}deg);
          }
          100% {
            transform: translate(-50%, -50%)
              translate(${sparkle.endX}px, ${sparkle.endY}px) scale(0)
              rotateZ(${sparkle.rotation + sparkle.rotationSpeed}deg);
            opacity: 0;
          }
        }
        @keyframes sparkle-rotate-${sparkle.id} {
          from {
            filter: hue-rotate(0deg) brightness(1);
          }
          to {
            filter: hue-rotate(360deg) brightness(1.5);
          }
        }
      `}</style>
    </div>
  );

  return (
    <div
      className="absolute inset-0 overflow-visible pointer-events-none"
      style={{ perspective: "1000px" }}
    >
      {sparkles.map((sparkle) => (
        <SparkleParticle key={sparkle.id} sparkle={sparkle} />
      ))}

      {/* Additional 3D depth layers */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={`depth-${i}`}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              backgroundColor: ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4"][
                i % 4
              ],
              animationDelay: `${i * 0.1}s`,
              animationDuration: "1.5s",
              transform: `translateZ(${i * 10}px) scale(${1 - i * 0.1})`,
              opacity: 0.6 - i * 0.05,
            }}
          />
        ))}
      </div>

      {/* Burst effect rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((ring) => (
          <div
            key={`ring-${ring}`}
            className="absolute border-2 rounded-full pointer-events-none"
            style={{
              width: "20px",
              height: "20px",
              borderColor: ["#FFD700", "#FF6B6B", "#4ECDC4"][ring],
              animation: `expand-ring-${ring} 1.2s ease-out forwards`,
              animationDelay: `${ring * 0.1}s`,
              left: "-10px",
              top: "-10px",
              opacity: 0,
            }}
          >
            <style jsx>{`
              @keyframes expand-ring-${ring} {
                0% {
                  transform: scale(0.1) rotate(0deg);
                  opacity: 0.8;
                  border-width: 3px;
                }
                50% {
                  opacity: 0.6;
                  border-width: 2px;
                }
                100% {
                  transform: scale(${3 + ring * 2}) rotate(180deg);
                  opacity: 0;
                  border-width: 1px;
                }
              }
            `}</style>
          </div>
        ))}
      </div>

      {/* Additional floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={`float-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                "#FFD700",
                "#FFA500",
                "#FF6B6B",
                "#4ECDC4",
                "#45B7D1",
              ][i % 5],
              animation: `float-particle-${i} ${
                1 + Math.random()
              }s ease-in-out forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          >
            <style jsx>{`
              @keyframes float-particle-${i} {
                0% {
                  transform: translateY(0px) translateX(0px) scale(0);
                  opacity: 0;
                }
                20% {
                  opacity: 1;
                  transform: translateY(-${10 + Math.random() * 20}px)
                    translateX(${(Math.random() - 0.5) * 40}px) scale(1);
                }
                100% {
                  transform: translateY(-${30 + Math.random() * 40}px)
                    translateX(${(Math.random() - 0.5) * 80}px) scale(0);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Cart Icon Component
const CartIcon = ({ cartCount, onCartClick }) => {
  const [showSparkle, setShowSparkle] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    // Trigger sparkle animation when cart count increases
    if (cartCount > prevCountRef.current && prevCountRef.current !== null) {
      setShowSparkle(true);
      setIsAnimating(true);

      // Reset animation after duration
      const timer = setTimeout(() => {
        setShowSparkle(false);
        setIsAnimating(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  return (
    <div
      className={`relative cursor-pointer pt-1 mr-4 lg:mr-0 transition-all duration-300 ${
        isAnimating ? "animate-bounce scale-110" : ""
      } ${isHovered ? "scale-105" : ""}`}
      onClick={onCartClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        filter: isAnimating
          ? "drop-shadow(0 4px 8px rgba(255, 59, 59, 0.3))"
          : "none",
      }}
    >
      <ShoppingCart
        className={`h-6 w-6 transition-all duration-300 ${
          isAnimating ? "text-red-500" : "text-gray-700"
        } ${isHovered ? "text-red-400" : ""}`}
      />
      <div
        className={`absolute -top-2 -right-2 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
          isAnimating
            ? "scale-125 bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg"
            : "bg-red-500"
        } ${isHovered ? "bg-red-400" : ""}`}
        style={{
          boxShadow: isAnimating
            ? "0 0 15px rgba(255, 193, 7, 0.6), 0 0 30px rgba(255, 193, 7, 0.3)"
            : "none",
        }}
      >
        {cartCount}
      </div>
      <SparkleEffect isActive={showSparkle} />

      {/* Hover sparkles */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={`hover-${i}`}
              className="absolute w-1 h-1 bg-red-400 rounded-full animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Navbar = ({ setNavCategory }) => {
  const token = localStorage.getItem("authToken");
  const [location, setLocation] = useState({ city: "", pincode: "" });
  const { category, loading, error } = useCategory();
  const sortedCategories = [...(category || [])].sort((a, b) => a.id - b.id);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [city, setCity] = useState("");
  const cartIntervalRef = useRef(null);

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

  // Also listen for cart update events
  useEffect(() => {
    window.addEventListener("cartUpdated", fetchCartItems);
    return () => {
      window.removeEventListener("cartUpdated", fetchCartItems);
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
    window.dispatchEvent(new Event("cartUpdated"));
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

        <div
          className="ml-2 lg:ml-16 cursor-pointer flex-none"
          onClick={() => {
            navigate("/home");
            setNavCategory("Home");
          }}
        >
          <img
            src="https://res.cloudinary.com/df622sxkk/image/upload/v1747778280/Group_17_hn00uo.png"
            alt="Logo"
            className="h-10 w-28 pt-2 lg:pt-0 lg:h-[3.28rem] lg:w-36 object-contain"
            style={{ minWidth: "9rem", minHeight: "3.28rem" }}
          />
        </div>

        <div className="hidden lg:block lg:ml-44">
          <div
            className="bg-red-50 flex items-center h-12 w-48 rounded-xl border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => setShowLocationModal(true)}
          >
            <MapPin className="h-5 w-5 text-red-500 ml-4" />
            <div className="flex flex-col justify-center">
              <p className="text-xs text-red-400 leading-none ml-3">
                Deliver to
              </p>
              <p className="font-medium text-black mt-0.5 ml-3 flex items-center text-xs">
                {location.city || "Select Location"},
                <span className="font-medium text-xs">{location.pincode}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:block md:w-64 lg:w-[35rem] ml-4">
          <Search
            placeholder="Search for Gifts, Categories, Occasions..."
            setNavCategory={setNavCategory}
          />
        </div>

        <div className="flex items-center ml-auto lg:mx-32">
          <CartIcon
            cartCount={cartCount}
            onCartClick={() => navigate("/cart")}
          />

          <div className="hidden lg:block">
            {token ? (
              <ProfileDropdown navigate={navigate} />
            ) : (
              <div className="flex items-center justify-center w-32 h-10 rounded-xl bg-[#FF3B3B] text-white font-thin ml-4">
                <p
                  className="text-sm font-extralight cursor-pointer"
                  onClick={() => navigate("/signin")}
                >
                  Login/Register
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden px-4 py-2 border-b">
        <Search placeholder="Search..." setNavCategory={setNavCategory} />
      </div>

      <div className="hidden lg:flex items-center justify-center space-x-6 h-12 border-b">
        <div>
          <CategoryDropdown
            setNavCategory={setNavCategory}
            navigate={navigate}
          />
        </div>
        <button
          className="px-4 py-2 text-gray-600 hover:text-red-500 text-sm font-medium"
          onClick={() => {
            navigate("/all");
            setNavCategory("All Products");
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
  window.dispatchEvent(new Event("cartUpdated"));
};

export default Navbar;
