import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAllCategories from '../hooks/useAllCategories';
import useProducts from '../hooks/useProduct';

const CategoryDropdown = ({setNavCategory, navigate}) => {
  const [isHovered, setIsHovered] = useState(false);
  const {allCategories, allOccasions, allRecipients, loading, error} = useAllCategories();
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
      // Assuming recipients might be stored in category or some other field
      // Adjust this logic based on your data structure
      matchingProducts = products.filter(product => 
        product.category && product.category.includes(itemName)
      );
    }
    
    // Return the first matching product (you could sort by date if available)
    return matchingProducts && matchingProducts.length > 0 ? matchingProducts[0] : null;
  };
  
  // Handle mouse hover on category/occasion/recipient
  const handleItemHover = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
  };
  
  // Get the product to display in the image area
  const productToDisplay = selectedItem ? 
    findMatchingProduct(selectedItem, selectedType) : null;
  
  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <button className="px-4 py-2 text-gray-600 hover:text-red-500 text-sm font-medium flex items-center gap-1" onClick={() => navigate('/all')}>
        Categories
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {isHovered && (
        <div className="absolute top-full left-0 bg-white rounded-lg shadow-lg w-[1000px] p-6 z-20 grid grid-cols-4 gap-8">
          <div className="col-span-1">
            {productsLoading ? (
              <div className="bg-gray-200 rounded-lg w-full h-64 flex items-center justify-center text-gray-600">
                Loading...
              </div>
            ) : productToDisplay ? (
                    <div className="bg-white rounded-lg w-full h-64 flex flex-col items-center justify-center cursor-pointer" onClick={() => navigate(`/product/${productToDisplay.title}`)}>
                        <img 
                        src={productToDisplay.image} 
                        alt={productToDisplay.title} 
                        className="max-h-48 max-w-full object-contain mb-2"
                        />
                        <p className="text-sm font-medium text-center">{productToDisplay.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                        <span className="text-red-500 font-medium">₹{productToDisplay.discountedPrice}</span>
                        {productToDisplay.discount > 0 && (
                            <>
                                <span className="text-gray-400 line-through text-xs">₹{productToDisplay.price}</span>
                                <span className="text-green-500 text-xs">{productToDisplay.discount}% off</span>
                            </>
                        )}
                        </div>
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg p-8 w-full h-64 flex items-center justify-center text-gray-600">
                Hover over an item to see product
              </div>
            )}
          </div>

          <div className="col-span-1">
            <h3 className="font-medium text-sm mb-4">Categories</h3>
            <div className="space-y-3">
              {allCategories.map((item) => (
                <button 
                  key={item} 
                  className="block text-gray-600 text-sm hover:text-red-500 w-full text-left" 
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

          <div className="col-span-1">
            <h3 className="font-medium text-sm mb-4">Gifts for Recipients</h3>
            <div className="space-y-3">
              {allRecipients.map((item) => (
                <button 
                  key={item} 
                  className="block text-gray-600 text-sm hover:text-red-500 w-full text-left" 
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
            <h3 className="font-medium text-sm mb-4">Gifts for Occasions</h3>
            <div className="space-y-3">
              {allOccasions.map((item) => (
                <button 
                  key={item} 
                  className="block text-gray-600 text-sm hover:text-red-500 w-full text-left" 
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