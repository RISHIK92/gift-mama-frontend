import { ProductCard } from "./product";
import useProducts from "../hooks/useProduct";
import { AlertCircle, RefreshCw } from "lucide-react"; // Assuming you're using lucide-react for icons

export const Customized = ({ title, customCategory }) => {
  const { products, loading, error } = useProducts();
  const category = products.filter((product) =>
    product.category.includes(customCategory)
  );

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

  // Error state
  if (error) {
    return (
      <div className="my-12 px-6">
        <h2 className="text-2xl font-serif italic ml-4 sm:ml-20">{title}</h2>
        <ErrorDisplay
          message={`Failed to load ${customCategory} products: ${error}`}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // No products found for this category
  if (category.length === 0) {
    return (
      <div className="my-12 px-6">
        <h2 className="text-2xl font-serif italic ml-4 sm:ml-20">{title}</h2>
        <div className="text-center py-12 px-4">
          <div className="inline-block mb-4 opacity-70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <p className="text-gray-500 animate-fadeIn">
            No {customCategory} products available!
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Check back soon for new additions
          </p>
        </div>
      </div>
    );
  }

  // Main render with products
  return (
    <div className="my-12 px-6">
      <h2 className="text-2xl font-serif italic ml-4 sm:ml-20">{title}</h2>
      <div className="relative">
        {/* Gradient overlays for scroll indication */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>

        <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap space-x-4 px-4 sm:px-20 mt-4 pb-2">
          {category.map((product) => (
            <div key={product.id} className="animate-fadeIn">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
