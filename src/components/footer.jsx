import React from "react";

export const Footer = () => {
  const googleMapsUrl = "https://www.google.com/maps?q=Hyderabad,India&output=embed";
  
  return (
    <footer className="bg-white mt-8">
      <div className="bg-[#FF3B3B] h-3"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="https://res.cloudinary.com/dvweoxpun/image/upload/v1740154234/photomama1_chtuu9.png" 
                alt="PhotoMAMA Gifts Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-xs mb-4">
              <strong>Address:</strong> Dundoo Enclave, Street Number 1, Walker Town,<br />
              Padmarao Nagar, Secunderabad,<br />
              Telangana 500025
            </p>
            <p className="text-sm font-medium mb-3">
              Have any queries?{" "}
              <a href="#" className="text-[#FF3B3B] hover:underline">
                Contact Support
              </a>
            </p>
            <p className="text-sm">
              We also offer Photography Services
              <br />
              <a href="#" className="text-black font-bold hover:text-[#FF3B3B]">
                Click to redirect to PhotoMAMA Photography
              </a>
            </p>
          </div>
          
          {/* Categories */}
          <div className="lg:ml-12">
            <h3 className="font-bold mb-4 text-lg">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#FF3B3B]">Birthday</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Wedding</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Corporate Events</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Festivals</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Casual</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Trending Frames</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Customized</a></li>
            </ul>
          </div>
          
          {/* Shortcuts */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Shortcuts</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#FF3B3B]">My Account</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Cart</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Login</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Register</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">PhotoMAMA Photography</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Home</a></li>
              <li><a href="#" className="hover:text-[#FF3B3B]">Support</a></li>
            </ul>
          </div>
          
          {/* Maps */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Maps</h3>
            <iframe 
              src={googleMapsUrl} 
              className="w-full h-48 rounded border border-gray-300" 
              allowFullScreen 
              loading="lazy" 
              title="Google Maps"
            ></iframe>
          </div>
        </div>
      </div>
      
      <hr className="mx-4 md:mx-8 lg:mx-16" />
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between text-sm">
          <div className="mb-4 sm:mb-0">
            © 2025 PhotoMAMA Gifts | Website by{" "}
            <a href="#" className="text-[#FF3B3B] hover:underline">
              AJS Innovations
            </a>
          </div>
          <div className="space-x-2">
            <a href="#" className="text-[#FF3B3B] hover:underline">
              Terms of Service
            </a>
            <span>|</span>
            <a href="#" className="text-[#FF3B3B] hover:underline">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="text-[#FF3B3B] hover:underline">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;