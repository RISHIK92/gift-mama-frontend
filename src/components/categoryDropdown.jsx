import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAllCategories from '../hooks/useAllCategories';
import useProducts from '../hooks/useProduct';

const CategoryDropdown = ({setNavCategory, navigate}) => {
  const [isHovered, setIsHovered] = useState(false);
  const {allOccasions, allRecipients, categories, loading, error} = useAllCategories();
  const { products, loading: productsLoading } = useProducts();
  const [selectedType, setSelectedType] = useState('category');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Function to find the latest product matching a category, occasion or recipient
  const findMatchingProduct = (itemName, type) => {
    if (!products || products.length === 0) return null;
    
    let matchingProducts;
    if (type === 'category') {
      matchingProducts = products.filter(product => 
        product.category && product.category.includes(itemName)
      );
    } else if (type === 'occasion') {
      matchingProducts = products.filter(product => 
        product.occasion && product.occasion.includes(itemName)
      );
    } else if (type === 'recipient') {
      matchingProducts = products.filter(product => 
        product.category && product.category.includes(itemName)
      );
    }
    
    return matchingProducts && matchingProducts.length > 0 ? matchingProducts[0] : null;
  };
  
  const handleItemHover = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
  };
  
  const productToDisplay = selectedItem ? 
    findMatchingProduct(selectedItem, selectedType) : null;
  
  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <button className="px-4 py-2 text-gray-600 hover:text-red-500 font-medium flex items-center gap-1 transition-colors duration-200" onClick={() => navigate('/all')}>
        Categories
        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
      </button>
      
      {isHovered && (
        <div className="absolute top-full -left-8 bg-white rounded-lg shadow-xl w-[900px] p-8 z-20 grid grid-cols-4 gap-8 border border-gray-100 animate-fadeIn">
          <div className="col-span-1">
            {productsLoading ? (
              <div className="bg-gray-100 rounded-lg w-full h-64 flex items-center justify-center text-gray-500 shadow-inner">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p>Loading...</p>
                </div>
              </div>
            ) : productToDisplay ? (
                    <div className="bg-white rounded-lg w-full h-64 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow duration-200 p-4 border border-gray-100" onClick={() => navigate(`/product/${productToDisplay.title}`)}>
                        <div className="h-48 w-full flex items-center justify-center mb-3">
                          <img 
                            src={productToDisplay.image} 
                            alt={productToDisplay.title} 
                            className="max-h-44 max-w-full object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-sm font-medium text-center text-gray-800 line-clamp-1">{productToDisplay.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-red-500 font-semibold">₹{productToDisplay.discountedPrice}</span>
                          {productToDisplay.discount > 0 && (
                              <>
                                  <span className="text-gray-400 line-through text-xs">₹{productToDisplay.price}</span>
                                  <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">{productToDisplay.discount}% off</span>
                              </>
                          )}
                        </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg w-full h-64 flex items-center justify-center text-gray-500 border border-dashed border-gray-300">
                <div className="text-center p-4">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p>Hover over an item to see product</p>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-1 border-r border-gray-100 pr-6">
            <h3 className="font-medium text-gray-800 mb-4 uppercase text-xs tracking-wider">Categories</h3>
            <div className="space-y-2">
              {categories.map((item) => (
                <button 
                  key={item} 
                  className="block text-gray-600 text-sm hover:text-red-500 w-full text-left py-1 hover:translate-x-1 transition-transform duration-200" 
                  onClick={() => {
                    navigate(`/category/${item}`);
                    setNavCategory(item);
                  }}
                  onMouseEnter={() => handleItemHover(item, 'category')}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-1 border-r border-gray-100 pr-6">
            <h3 className="font-medium text-gray-800 mb-4 uppercase text-xs tracking-wider">Gifts for Recipients</h3>
            <div className="space-y-2">
              {allRecipients.map((item) => (
                <button 
                  key={item} 
                  className="block text-gray-600 text-sm hover:text-red-500 w-full text-left py-1 hover:translate-x-1 transition-transform duration-200" 
                  onClick={() => {
                    navigate(`/category/${item}`);
                    setNavCategory(item);
                  }}
                  onMouseEnter={() => handleItemHover(item, 'recipient')}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="font-medium text-gray-800 mb-4 uppercase text-xs tracking-wider">Gifts for Occasions</h3>
            <div className="space-y-2">
              {allOccasions.map((item) => (
                <button 
                  key={item} 
                  className="block text-gray-600 text-sm hover:text-red-500 w-full text-left py-1 hover:translate-x-1 transition-transform duration-200" 
                  onClick={() => {
                    navigate(`/category/${item}`);
                    setNavCategory(item);
                  }}
                  onMouseEnter={() => handleItemHover(item, 'occasion')}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;