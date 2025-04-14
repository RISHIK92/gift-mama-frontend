import React, { useState, useEffect } from 'react';
import { Wallet2, ShoppingBag, Heart, User, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Profile from './profile';
import Wallet from './wallet';
import { Wishlist } from './wishlist';
import { OrderHistory } from './orderHistory';

const Profileside = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/signin');
    }
  }, [token, navigate]);

  const renderComponent = () => {
    switch (activeTab) {
      case "account":
        return <Profile />
      case "wallet":
        return <Wallet />;
      case "wishlist":
        return <Wishlist />;
      case "orders":
        return <OrderHistory />;
      default:
        return <Profile />;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="md:hidden bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-red-600">My Account</h1>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg z-20 animate-slideDown">
            <SidebarMenu 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              isMobile={true}
            />
          </div>
        )}
      </div>

      <div className={`hidden md:block transition-all duration-300 ease-in-out bg-white border-r shadow-sm relative
        ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-red-500 text-white rounded-full p-1 shadow-md"
        >
          <ChevronRight 
            size={16} 
            className={`transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        <div className="p-4 flex items-center justify-center border-b">
          {sidebarOpen ? (
            <h2 className="font-bold text-red-600 text-xl text-center">My Account</h2>
          ) : (
            <User className="text-red-600" size={24} />
          )}
        </div>
        <SidebarMenu 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          collapsed={!sidebarOpen}
        />
      </div>

      <div className="flex-1 transition-all duration-300">
        {renderComponent()}
      </div>
    </div>
  );
};

const SidebarMenu = ({ activeTab, setActiveTab, collapsed = false, isMobile = false }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: <User className="h-5 w-5" />, label: "ACCOUNT DETAILS", id: "account" },
    { icon: <Wallet2 className="h-5 w-5" />, label: "WALLET", id: "wallet" },
    { icon: <ShoppingBag className="h-5 w-5" />, label: "ORDERS", id: "orders" },
    { icon: <Heart className="h-5 w-5" />, label: "WISHLIST", id: "wishlist" },
    { icon: <LogOut className="h-5 w-5" />, label: "LOGOUT", id: "logout" }
  ];

  const handleItemClick = (id) => {
    if (id === "logout") {
      localStorage.removeItem('authToken');
      navigate('/signin');
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div className="py-2">
      {menuItems.map((item) => (
        <div
          key={item.id}
          className={`
            ${isMobile ? 'px-6 py-4' : 'px-4 py-3'} 
            ${collapsed ? 'justify-center' : 'justify-between'} 
            flex items-center cursor-pointer border-b last:border-b-0
            transition-colors duration-200 ease-in-out
            ${activeTab === item.id 
              ? 'bg-red-50 text-red-600 border-l-4 border-l-red-600' 
              : 'text-gray-700 hover:bg-gray-100 border-l-4 border-l-transparent'
            }
          `}
          onClick={() => handleItemClick(item.id)}
        >
          <div className="flex items-center">
            <div className={`
              ${activeTab === item.id ? 'text-red-600' : 'text-gray-500'} 
              ${!collapsed && !isMobile ? 'mr-3' : ''}
            `}>
              {item.icon}
            </div>
            
            {(!collapsed || isMobile) && (
              <span className={`
                font-medium text-sm
                ${activeTab === item.id ? 'text-red-600' : 'text-gray-700'}
              `}>
                {item.label}
              </span>
            )}
          </div>
          
          {(!collapsed && !isMobile && activeTab === item.id) && (
            <ChevronRight size={16} className="text-red-600" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Profileside;