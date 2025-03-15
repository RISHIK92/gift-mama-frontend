import { CheckCircle, Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BACKEND_URL } from "../Url";

export const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [keepVisible, setKeepVisible] = useState(false);
    
    const addToCart = async (e) => {
        e.stopPropagation();
        try {
            setIsLoading(true);
            setKeepVisible(true);
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                navigate('/signin');
                return;
            }
            
            const response = await fetch(`${BACKEND_URL}cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: 1
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setKeepVisible(false);
            }, 1000);
        }
    };
    
    return (
        <div className="bg-white rounded-lg w-[270px] group mr-1 mb-8">
            <div className="bg-[#D9D9D9] rounded-xl relative overflow-hidden w-[270px] h-[270px]">
                {product.discount && (
                    <div className="bg-[#FF3B3B] absolute text-white text-xs px-2 py-1 left-2 top-2 rounded-lg">
                        {Math.round(product.discount)}% off
                    </div>
                )}
                <img
                     src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-xl" 
                    onClick={() => navigate(`/product/${product.title}`)}
                />
                <div 
                    className={`absolute right-2 top-2 flex flex-col gap-2 transition-opacity duration-300 ${
                        keepVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                >
                <button 
                        className="p-2 bg-[#FF3B3B] rounded-full hover:bg-red-400 transition flex items-center justify-center"
                        onClick={addToCart}
                        disabled={isLoading || showSuccess}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : showSuccess ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                            <ShoppingCart className="w-5 h-5 text-white" />
                        )}
                    </button>
                    <button className="p-2 bg-[#FF3B3B] rounded-full hover:bg-red-400 transition">
                        <Heart className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
            <div className="mt-3 w-[270px]">
                <h2 className="text-lg font-semibold truncate">{product.title}</h2>
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-red-500 font-medium">₹{product.discountedPrice}</span>
                    {product.price > product.discountedPrice && (
                        <span className="text-gray-400 line-through">₹{product.price}</span>
                    )}
                </div>
                <p className="text-xs text-gray-500">
                    {product.inclusiveOfTaxes ? "Inclusive of all taxes" : "Exclusive of taxes"}
                </p>
            </div>
        </div>
    );
};