import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { BACKEND_URL } from "../Url";

const ProductCardSkeleton = () => (
  <div className="min-w-[220px] flex-shrink-0 animate-pulse flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
    <div className="w-64 h-64 bg-gray-300 rounded-lg mb-3"></div>
    <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/4 mb-3"></div>
    <div className="h-10 bg-gray-300 rounded w-3/4"></div>
  </div>
);


const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime) - new Date();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="text-black mt-4">
      <div className="text-xs font-bold">
        Offer Ends in
      </div>
      <div className="text-2xl mt-1 font-bold text-black">
        {`${String(timeLeft.days).padStart(2, "0")}d ${String(timeLeft.hours).padStart(
          2,
          "0"
        )}h ${String(timeLeft.minutes).padStart(2, "0")}m ${String(timeLeft.seconds).padStart(2, "0")}s`}
      </div>
    </div>
  );
};

export const ProductCard = ({
  image,
  title,
  originalPrice,
  salePrice,
  discount,
  showTimer,
  showIcons,
  endTime
}) => (
  <div className="group relative bg-white rounded-lg overflow-hidden p-4 flex flex-col md:flex-row gap-6 items-center">
    <div className="relative w-64 h-64 flex-shrink-0 bg-gray-200 rounded-xl">
      <img src={image || "/api/placeholder/400/300"} className="w-64 h-64 object-cover rounded-xl" alt={title} />
      
      {showIcons && (
        <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-red-500 rounded-full hover:bg-red-400 transition">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 bg-red-500 rounded-full hover:bg-red-400 transition">
            <Eye className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>

    <div className="flex-1 w-auto md:w-72">
      <h3 className="font-bold text-2xl break-words text-wrap">{title}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-red-500 font-medium">₹{salePrice}</span>
        <span className="text-gray-400 line-through">₹{originalPrice}</span>
        {discount && (
        <div className="bg-red-500 text-white text-xs px-1 py-1 rounded-lg">
          {discount}% off
        </div>
      )}
      </div>
      <p className="text-xs text-gray-500">Inclusive of all taxes</p>

      {showTimer && endTime && <CountdownTimer endTime={endTime} />}

      <button className="w-48 mt-1 bg-red-500 text-white text-xs py-3 rounded-xl hover:bg-red-600 flex items-center justify-center gap-2 transition">
        <ShoppingCart className="w-4 h-4" />
        Buy Now
      </button>
    </div>
  </div>
);

export const FlashSale = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}flash-sales`);
        const data = await response.json();
        setFlashSales(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching flash sales:", err);
        setError("Failed to load flash sales. Please try again later.");
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (flashSales.length === 0) return null;

  return (
    <>
      {flashSales.map((sale) => (
        <div key={sale.id} className="my-8 mt-12">
          <h2 className="text-2xl font-serif italic mb-4 ml-20 mt-10">{sale.description}</h2>
          <div className="flex mr-10 overflow-x-auto scrollbar-hide justify-around">
            {sale.items.map((item) => (
              <ProductCard 
                key={item.id}
                image={item.product.images[0]?.mainImage || "/api/placeholder/400/300"}
                title={item.product.name}
                originalPrice={item.product.price.toString()}
                salePrice={item.salePrice.toString()}
                discount={parseInt(item.discount)}
                showTimer={true}
                showIcons={true}
                endTime={sale.endTime}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default FlashSale;