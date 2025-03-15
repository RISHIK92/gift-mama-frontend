import React, { useState, useEffect } from 'react';
import { ProductCard } from './product';
import { SearchIcon } from "lucide-react";
import useProducts from '../hooks/useProduct';
import useAllCategories from '../hooks/useAllCategories';

const Search = ({ type = "text", placeholder, value, onChange }) => {
  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative flex items-center text-md px-2 py-2">
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value}
        onChange={handleInputChange}
        className="bg-gray-100 px-12 py-3 pr-10 font-extralight text-sm border border-gray-300 rounded-xl w-full" 
      />
      <span className="absolute left-5 text-gray-500"><SearchIcon /></span>
    </div>
  );
};

const CategorySidebar = ({ selectedCategory, setSelectedCategory, selectedOccasion, setSelectedOccasion }) => {
  const { allCategories, allOccasions, loading, error } = useAllCategories();

  if (loading) return <div className="w-60 flex-shrink-0 p-4">Loading categories...</div>;
  if (error) return <div className="w-60 flex-shrink-0 p-4">Error loading categories: {error}</div>;

  return (
    <div className="w-60 flex-shrink-0 h-full min-h-screen border-r ml-14 border-gray-600 p-4">
      <div className="mb-6 border-b pb-5 border-gray-300">
        <h2 className="font-semibold text-sm mb-3">Categories</h2>
        <ul className="space-y-4">
          <li>
            <button
              className={`text-sm ${!selectedCategory ? "text-red-500" : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </button>
          </li>
          {allCategories.map((category, index) => (
            <li key={index}>
              <button
                className={`text-sm hover:text-red-500 ${selectedCategory === category ? "text-red-500 font-bold" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold text-sm mb-3">Gifts for Occasions</h2>
        <ul className="space-y-4 mb-6 border-b pb-5 border-gray-300">
          <li>
            <button
              className={`text-sm ${!selectedOccasion ? "text-red-500" : ""}`}
              onClick={() => setSelectedOccasion(null)}
            >
              All Occasions
            </button>
          </li>
          {allOccasions.map((occasion, index) => (
            <li key={index}>
              <button
                className={`text-sm hover:text-red-500 ${selectedOccasion === occasion ? "text-red-500 font-bold" : ""}`}
                onClick={() => setSelectedOccasion(occasion)}
              >
                {occasion}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Header = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex items-end justify-end mr-12">      
      <div className="mx-4">
        <div className="w-full md:w-96 mt-4">
          <Search 
            placeholder="Search for Gifts, Categories, Occasions..." 
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
      </div>
    </div>
  );
};

export const GiftShopPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { products, loading, error } = useProducts();
  const productsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedOccasion, searchTerm]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading products...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">Error loading products: {error}</div>;

  const filteredProducts = products.filter(product => {
    const searchMatch = searchTerm.trim() === '' || 
      (product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const categoryMatch = selectedCategory ? product.category.includes(selectedCategory) : true;
    
    const occasionMatch = selectedOccasion ? product.occasion.includes(selectedOccasion) : true;
    
    return searchMatch && categoryMatch && occasionMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  if (safeCurrentPage !== currentPage) {
    setCurrentPage(safeCurrentPage);
  }
  
  const indexOfLastProduct = safeCurrentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-[#FFECEC] h-52">
        <div className="flex justify-center">
          <p className="mt-24 text-3xl font-medium">All Products</p>
        </div>
      </div>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <div className="flex flex-col md:flex-row">
        <CategorySidebar 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory} 
          selectedOccasion={selectedOccasion} 
          setSelectedOccasion={setSelectedOccasion} 
        />
        
        <div className="mt-10 flex-grow">
          {searchTerm && (
            <div className="ml-16 mb-4">
              <p className="text-gray-700">
                Search results for: <span className="font-medium">{searchTerm}</span>
                {filteredProducts.length > 0 ? 
                  ` (${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found)` : 
                  ' (No products found)'}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap ml-4 md:ml-16 gap-4">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-gray-500 p-4">
                {searchTerm ? 
                  'No products matching your search criteria.' : 
                  'No products found for the selected filters.'}
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 mb-8 space-x-2">
              <button 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50 transition-colors" 
                onClick={handlePrevPage} 
                disabled={currentPage <= 1} 
              >
                Previous
              </button>
              <span className="text-gray-700 px-4 py-2">Page {currentPage} of {totalPages}</span>
              <button 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50 transition-colors" 
                onClick={handleNextPage} 
                disabled={currentPage >= totalPages} 
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftShopPage;