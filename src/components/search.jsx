import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../Url';
import { useNavigate } from 'react-router-dom';
import useAllCategories from '../hooks/useAllCategories';
import useProducts from '../hooks/useProduct';

export const Search = ({ placeholder, setNavCategory }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    categories: [],
    products: [],
    occasions: [],
    recipients: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  // Get data from custom hooks
  const { allCategories, allOccasions, allRecipients, loading: categoriesLoading } = useAllCategories();
  const { products, loading: productsLoading } = useProducts();

  // Create initial suggestions based on the hooks data
  const getInitialSuggestions = () => {
    return {
      categories: allCategories.slice(0, 4),
      products: products.slice(0, 4).map(product => ({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.image
      })),
      occasions: allOccasions.slice(0, 4),
      recipients: allRecipients.slice(0, 4)
    };
  };

  useEffect(() => {
    // Handle clicks outside the dropdown to close it
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Debounced search function
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() && isDropdownOpen) {
        fetchSearchResults();
      }
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  const fetchSearchResults = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(`${BACKEND_URL}search?query=${searchQuery}`);
      
      // Assuming the API returns data in the expected format
      setSearchResults({
        categories: response.data.categories || [],
        products: response.data.products || [],
        occasions: response.data.occasions || [],
        recipients: response.data.recipients || []
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
      // Show filtered results from our hooks data if the API fails
      const query = searchQuery.toLowerCase();
      
      setSearchResults({
        categories: allCategories.filter(item => 
          item.toLowerCase().includes(query)
        ).slice(0, 4),
        products: products
          .filter(product => product.title.toLowerCase().includes(query))
          .slice(0, 4)
          .map(product => ({
            id: product.id,
            name: product.title,
            price: product.price,
            image: product.image
          })),
        occasions: allOccasions.filter(item => 
          item.toLowerCase().includes(query)
        ).slice(0, 4),
        recipients: allRecipients.filter(item => 
          item.toLowerCase().includes(query)
        ).slice(0, 4)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = () => {
    setIsDropdownOpen(true);
    // Show initial suggestions when the search box is first clicked
    if (!searchQuery.trim()) {
      // Only show suggestions if we have data from hooks
      if (!categoriesLoading && !productsLoading) {
        setSearchResults(getInitialSuggestions());
      }
    }
  };

  const handleItemClick = (type, item) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    if (type === 'category' || type === 'occasion' || type === 'recipient') {
      navigate(`/category/${item}`);
      if (setNavCategory) {
        setNavCategory(item);
      }
    } else if (type === 'product') {
      // Use product name for navigation instead of ID
      const productName = typeof item === 'object' ? item.name : item;
      navigate(`/product/${encodeURIComponent(productName)}`);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full pl-10 p-2.5"
            placeholder={placeholder || "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={handleSearchClick}
            onFocus={handleSearchClick}
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => {
                setSearchQuery('');
                inputRef.current.focus();
              }}
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </form>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 bg-white rounded-lg shadow-lg w-full z-20 mt-1 max-h-[80vh] overflow-y-auto">
          <div className="p-4">
            {isLoading || categoriesLoading || productsLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Categories Section */}
                {searchResults.categories.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2 text-sm">Categories</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {searchResults.categories.map((category, index) => (
                        <div 
                          key={`category-${index}`}
                          className="px-3 py-2 text-sm bg-gray-50 rounded-md hover:bg-red-50 cursor-pointer transition-colors"
                          onClick={() => handleItemClick('category', category)}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Section */}
                {searchResults.products.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2 text-sm">Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.products.map((product, index) => (
                        <div 
                          key={`product-${index}`}
                          className="flex items-center gap-2 p-2 border rounded-md hover:border-red-200 cursor-pointer"
                          onClick={() => handleItemClick('product', product)}
                        >
                          <div className="bg-gray-200 w-12 h-12 rounded flex items-center justify-center text-xs text-gray-500">
                            {typeof product === 'object' && product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              'Image'
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{typeof product === 'object' ? product.name : product}</p>
                            {typeof product === 'object' && product.price && (
                              <p className="text-xs text-gray-600">₹{product.price}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Occasions Section */}
                {searchResults.occasions.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2 text-sm">Occasions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {searchResults.occasions.map((occasion, index) => (
                        <div 
                          key={`occasion-${index}`}
                          className="px-3 py-2 text-sm bg-gray-50 rounded-md hover:bg-red-50 cursor-pointer transition-colors"
                          onClick={() => handleItemClick('occasion', occasion)}
                        >
                          {occasion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recipients Section */}
                {searchResults.recipients.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2 text-sm">Recipients</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {searchResults.recipients.map((recipient, index) => (
                        <div 
                          key={`recipient-${index}`}
                          className="px-3 py-2 text-sm bg-gray-50 rounded-md hover:bg-red-50 cursor-pointer transition-colors"
                          onClick={() => handleItemClick('recipient', recipient)}
                        >
                          {recipient}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show message when no results are found */}
                {searchQuery.trim() && 
                 !isLoading && 
                 !searchResults.categories.length && 
                 !searchResults.products.length && 
                 !searchResults.occasions.length && 
                 !searchResults.recipients.length && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                )}

                {/* Show all results button */}
                {searchQuery.trim() && (
                  searchResults.categories.length > 0 || 
                  searchResults.products.length > 0 || 
                  searchResults.occasions.length > 0 || 
                  searchResults.recipients.length > 0
                ) && (
                  <div className="text-center pt-2 border-t">
                    <button 
                      className="text-red-500 hover:text-red-600 font-medium text-sm py-2"
                      onClick={handleSearchSubmit}
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};