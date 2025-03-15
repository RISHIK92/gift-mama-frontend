import React from "react";

export const Footer = () => {
  const googleMapsUrl = "https://www.google.com/maps?q=Hyderabad,India&output=embed";

  return (
    <footer className="bg-white mt-8">
      <div className="bg-[#FF3B3B] h-3"></div>
      <div className="flex gap-24 mt-12 ml-20">
        <div>
          <div className="flex items-center mb-4">
            <img src="https://res.cloudinary.com/dvweoxpun/image/upload/v1740154234/photomama1_chtuu9.png" alt="PhotoMAMA Gifts Logo" className="h-[4rem] w-48" />
          </div>
          <p className="text-xs">
            <strong>Address:</strong> Dundoo Enclave, Street Number 1, Walker Town,<br />
            Padmarao Nagar, Secunderabad,<br />
            Telangana 500025
          </p>
          <p className="text-sm font-bold my-2">
            Have any queries?{" "}
            <a href="#" className="text-black underline">
              Contact Support
            </a>
          </p>
          <p className="text-sm mt-3">
            We also offer Photography Services
            <br />
            <a href="#" className="text-black font-bold">
              Click to redirect to PhotoMAMA Photography
            </a>
          </p>
        </div>

        <div className="left-1/4 -ml-0.5 w-0.5 bg-gray-300"></div>

        <div className="flex">
          <div className="mr-24">
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#">Birthday</a></li>
              <li><a href="#">Wedding</a></li>
              <li><a href="#">Corporate Events</a></li>
              <li><a href="#">Festivals</a></li>
              <li><a href="#">Casual</a></li>
              <li><a href="#">Trending Frames</a></li>
              <li><a href="#">Customized</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Shortcuts</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#">My Account</a></li>
              <li><a href="#">Cart</a></li>
              <li><a href="#">Login</a></li>
              <li><a href="#">Register</a></li>
              <li><a href="#">PhotoMAMA Photography</a></li>
              <li><a href="#">Home</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="-ml-0.5 w-0.5 bg-gray-300"></div>

        <div>
          <h3 className="font-bold mb-4">Maps</h3>
          <iframe src={googleMapsUrl} className="w-80 h-48 rounded border border-gray-300" allowFullScreen loading="lazy" title="Google Maps"
          ></iframe>
        </div>
      </div>

      <hr className="mt-16 mx-20"></hr>

      <div className="mt-2 mx-20 pt-4 text-sm flex flex-wrap justify-between items-center">
        <div className="mb-4">
          © 2025 PhotoMAMA Gifts | Website by{" "}
          <a href="#" className="text-red-500 underline">
            AJS Innovations
          </a>
        </div>
        <div className="space-x-2 mb-4">
          <a href="#" className="text-red-500">
            Terms of Service
          </a>
          <span>|</span>
          <a href="#" className="text-red-500">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="#" className="text-red-500">
            Refund Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
