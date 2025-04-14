import { CheckCircle, Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../Url";
import axios from "axios";
import { toast } from "react-hot-toast"; // Import toast for notifications

export const ProductCard = ({ product, sortOption = "default", state = true }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [keepVisible, setKeepVisible] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    
    useEffect(() => {
        const checkWishlistStatus = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) return;
                
                const response = await axios.get(
                    `${BACKEND_URL}wishlist/check/${product.id}`,
                    { 
                        headers: { Authorization: `Bearer ${token}` },

                        timeout: 5000
                    }
                );
                
                setIsInWishlist(response.data?.isInWishlist === true);
            } catch (err) {
                console.error("Failed to check wishlist status:", err);
                setIsInWishlist(false);
            }
        };
        
        checkWishlistStatus();
    }, [product.id]);
    
    const discountPercentage = product.discount ||
        (product.price > product.discountedPrice 
            ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) 
            : 0);
    
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
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setKeepVisible(false);
            }, 1000);
        }
    };

    const handleWishlistToggle = async (e) => {
        e.stopPropagation(); // Prevent navigation
        
        // Prevent multiple clicks
        if (isWishlistLoading) return;
        
        try {
            setIsWishlistLoading(true);
            const token = localStorage.getItem("authToken");
            if (!token) {
                navigate('/signin');
                return;
            }
            
            const previousState = isInWishlist;
            
            setIsInWishlist(!previousState);
            
            if (previousState) {
                const response = await fetch(`${BACKEND_URL}wishlist/remove`, {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId: product.id })
                });
                
                if (response.ok) {
                    toast.success("Removed from wishlist");
                } else {
                    setIsInWishlist(true);
                    toast.error("Failed to remove from wishlist");
                }
            } else {
                const response = await axios.post(
                    `${BACKEND_URL}wishlist/add`,
                    { productId: product.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (response.status >= 200 && response.status < 300) {
                    toast.success("Added to wishlist");
                } else {
                    // Revert on failure
                    setIsInWishlist(false);
                    toast.error("Failed to add to wishlist");
                }
            }
        } catch (err) {
            console.error(`Failed to ${isInWishlist ? 'add to' : 'remove from'} wishlist:`, err);
            setIsInWishlist(!isInWishlist);
            toast.error(`Failed to ${isInWishlist ? 'add to' : 'remove from'} wishlist`);
        } finally {
            setIsWishlistLoading(false);
        }
    };
    
    const getBadgeColor = () => {
        if (discountPercentage >= 30) return "bg-red-600";
        if (discountPercentage >= 20) return "bg-red-500";
        if (discountPercentage >= 10) return "bg-red-400";
        return "bg-red-300";
    };
    
    return (
        <div className={`bg-white rounded-lg ${state ? "w-[230px]": "w-full"} shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-pointer`}>
            <div className="rounded-t-lg relative overflow-hidden pt-[100%]">
                {discountPercentage > 0 && (
                    <div className={`${getBadgeColor()} absolute text-white text-xs px-2 py-1 left-2 top-2 rounded-lg z-10`}>
                        {discountPercentage}% off
                    </div>
                )}
                
                {product.isNew && (
                    <div className="bg-green-500 absolute text-white text-xs px-2 py-1 right-2 top-2 rounded-lg z-10">
                        New
                    </div>
                )}
                
                <img
                    src={product.image}
                    alt={product.title}
                    className={`absolute top-0 left-0 ${state ? "w-[230px] h-[250px]": "w-full h-full"} object-cover transition-transform duration-500 group-hover:scale-105`} 
                    onClick={() => navigate(`/product/${product.title}`)}
                />
                
                <div 
                    className={`absolute right-2 top-2 flex flex-col gap-2 transition-opacity duration-300 ${
                        keepVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                >
                    <button 
                        className="p-2 bg-red-500 rounded-full hover:bg-red-400 transition flex items-center justify-center"
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
                    <button 
                        className={`p-2 ${isInWishlist ? "bg-red-500" : "bg-gray-700 hover:bg-red-400"} rounded-full transition`} 
                        onClick={handleWishlistToggle}
                        disabled={isWishlistLoading}
                        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {isWishlistLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <Heart 
                                className={`w-5 h-5 ${isInWishlist ? "text-white fill-white" : "text-white"}`} 
                            />
                        )}
                    </button>
                </div>
            </div>
            
            <div className="px-3 py-2">
                <h2 className="text-md font-semibold line-clamp-2 h-12" title={product.title}>
                    {product.title}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">₹{product.discountedPrice}</span>
                    {product.price > product.discountedPrice && (
                        <span className="text-gray-400 line-through text-sm">₹{product.price}</span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                        {product.inclusiveOfTaxes ? "Inclusive of all taxes" : "Exclusive of taxes"}
                    </p>
                    
                    {product.fastDelivery && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Fast Delivery</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export const sortProducts = (products, sortOption) => {
    if (!products || !products.length) return [];
    
    const productsCopy = [...products];
    
    switch (sortOption) {
        case "priceLow":
            return productsCopy.sort((a, b) => a.discountedPrice - b.discountedPrice);
        case "priceHigh":
            return productsCopy.sort((a, b) => b.discountedPrice - a.discountedPrice);
        case "discount":
            return productsCopy.sort((a, b) => {
                const discountA = a.discount || (a.price > a.discountedPrice ? ((a.price - a.discountedPrice) / a.price) * 100 : 0);
                const discountB = b.discount || (b.price > b.discountedPrice ? ((b.price - b.discountedPrice) / b.price) * 100 : 0);
                return discountB - discountA;
            });
        default:
            return productsCopy;
    }
};