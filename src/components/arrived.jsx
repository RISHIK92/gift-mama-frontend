import { ProductCard } from "./product";
import useProducts from '../hooks/useProduct.jsx';
import { RefreshCw, AlertCircle } from 'lucide-react';
export const productData = [

    {
        id: 1,
        title: "smartphone",
        price: 499,
        discount: 60,
        discountedPrice: 599,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true 
    },
    {
        id: 2,
        title: "Wireless Headphones",
        price: 149,
        discountedPrice: 199,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
        showIcons: true
    },
    {
        id: 3,
        title: "Gaming Laptop",
        price: 1199,
        discountedPrice: 1399,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true
    },
    {
        id: 4,
        title: "smart Watch",
        price: 199,
        discountedPrice: 249,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
        showIcons: true
    },
    {
        id: 5,
        title: "Bluetooth Speaker",
        price: 99,
        discountedPrice: 129,
        discount: 40,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true
    },
    {
        id: 1,
        title: "smartphone",
        price: 499,
        discount: 60,
        discountedPrice: 599,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true 
    },
    {
        id: 2,
        title: "Wireless Headphones",
        price: 149,
        discountedPrice: 199,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
        showIcons: true
    },
    {
        id: 3,
        title: "Gaming Laptop",
        price: 1199,
        discountedPrice: 1399,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true
    },
    {
        id: 4,
        title: "smart Watch",
        price: 199,
        discountedPrice: 249,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
        showIcons: true
    },
    {
        id: 5,
        title: "Bluetooth Speaker",
        price: 99,
        discountedPrice: 129,
        discount: 40,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true
    },
    {
        id: 1,
        title: "smartphone",
        price: 499,
        discount: 60,
        discountedPrice: 599,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true 
    },
    {
        id: 2,
        title: "Wireless Headphones",
        price: 149,
        discountedPrice: 199,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
        showIcons: true
    },
    {
        id: 3,
        title: "Gaming Laptop",
        price: 1199,
        discountedPrice: 1399,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true
    },
    {
        id: 4,
        title: "smart Watch",
        price: 199,
        discountedPrice: 249,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
        showIcons: true
    },
    {
        id: 5,
        title: "Bluetooth Speaker",
        price: 99,
        discountedPrice: 129,
        discount: 40,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true
    },
    {
        id: 1,
        title: "smartphone",
        price: 499,
        discount: 60,
        discountedPrice: 599,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true 
    },
    {
        id: 2,
        title: "Wireless Headphones",
        price: 149,
        discountedPrice: 199,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
        showIcons: true
    },
    {
        id: 3,
        title: "Gaming Laptop",
        price: 1199,
        discountedPrice: 1399,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true
    },
    {
        id: 4,
        title: "smart Watch",
        price: 199,
        discountedPrice: 249,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
        showIcons: true
    },
    {
        id: 5,
        title: "Bluetooth Speaker",
        price: 99,
        discountedPrice: 129,
        discount: 40,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
        showIcons: true
    }
];

export const NewlyArrived = ({ title }) => {
    const { products, loading, error } = useProducts();

    // Product card skeleton loader
    const ProductCardSkeleton = () => (
        <div className="min-w-[220px] flex-shrink-0 animate-pulse">
            <div className="h-64 bg-gray-300 rounded-md mb-2"></div>
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
    );

    // Error component with retry option
    const ErrorDisplay = ({ message, onRetry }) => (
        <div className="text-center my-8 px-4">
            <div className="inline-flex items-center justify-center p-2 bg-red-100 text-red-500 rounded-full mb-3">
                <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-red-500 mb-4">{message}</p>
            {onRetry && (
                <button 
                    onClick={onRetry} 
                    className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                </button>
            )}
        </div>
    );

    // Loading skeleton
    if (loading) {
        return (
            <div className="my-12 px-6">
                <h2 className="text-2xl font-serif italic ml-4 sm:ml-20">{title}</h2>
                <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap space-x-4 px-4 sm:px-20 mt-4">
                    {[1, 2, 3, 4, 5].map((index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-12 px-6">
                <h2 className="text-2xl font-serif italic ml-4 sm:ml-20">{title}</h2>
                <ErrorDisplay 
                    message={`Failed to load new arrivals: ${error}`}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="my-12 px-6">
                <h2 className="text-2xl font-serif italic ml-4 sm:ml-20">{title}</h2>
                <div className="text-center py-12 px-4">
                    <div className="inline-block mb-4 opacity-70">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                    <p className="text-gray-500 animate-fadeIn">No new arrivals yet!</p>
                    <p className="text-gray-400 text-sm mt-2">Check back soon for new products</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-12 px-6">
            <h2 className="text-2xl font-serif italic ml-4 sm:ml-20">{title}</h2>
            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                
                <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap space-x-4 px-4 sm:px-20 mt-4 pb-2">
                    {products.map((product) => (
                        <div key={product.id} className="animate-fadeIn">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};