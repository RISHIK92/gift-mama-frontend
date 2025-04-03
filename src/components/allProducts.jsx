import React, { useState, useEffect } from 'react';
import { ProductCard } from './product';
import { SearchIcon, UserCircle, Menu, X, Gift, Tag, Users, ChevronRight, ChevronLeft, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import useProducts from '../hooks/useProduct';
import useAllCategories from '../hooks/useAllCategories';

const Search = ({ type = "text", placeholder, value, onChange }) => {
  return (
    <div className="relative flex items-center w-full">
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/90 backdrop-blur-sm px-12 py-3 font-medium text-sm border-2 border-red-200 rounded-full w-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" 
      />
      <span className="absolute left-4 text-red-500"><SearchIcon strokeWidth={2.5} /></span>
    </div>
  );
};

const RecipientSidebar = ({ 
  selectedCategory, 
  setSelectedCategory, 
  selectedRecipient, 
  setSelectedRecipient,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen
}) => {
  const { allRecipients, categories, loading, error } = useAllCategories();

  if (loading) return <div className="p-4 animate-pulse">Loading categories...</div>;
  if (error) return <div className="p-4 text-red-600">Error loading categories: {error}</div>;

  const sidebarClasses = `
    fixed md:static top-0 bottom-0 left-0 z-50 
    w-80 md:w-64 h-full bg-white md:bg-transparent
    transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
    md:translate-x-0 transition-transform duration-300 ease-in-out
    overflow-y-auto border-r border-gray-200 p-6 md:p-4
    shadow-lg md:shadow-none
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}
      
      <div className={sidebarClasses}>
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="font-bold text-xl text-red-600">Filters</h2>
          <button onClick={() => setIsMobileSidebarOpen(false)} className="text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Tag className="text-red-500 mr-2" size={18} />
            <h2 className="font-bold text-gray-800">Categories</h2>
          </div>
          <ul className="space-y-3">
            <li>
              <button
                className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? "bg-red-100 text-red-600 font-medium" : "hover:bg-red-50"}`}
                onClick={() => {
                  setSelectedCategory(null);
                  setIsMobileSidebarOpen(false);
                }}
              >
                All Categories
              </button>
            </li>
            {categories.map((category, index) => (
              <li key={index}>
                <button
                  className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category ? "bg-red-100 text-red-600 font-medium" : "hover:bg-red-50"}`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsMobileSidebarOpen(false);
                  }}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <Users className="text-red-500 mr-2" size={18} />
            <h2 className="font-bold text-gray-800">Gifts by Recipient</h2>
          </div>
          <ul className="space-y-3">
            <li>
              <button
                className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedRecipient ? "bg-red-100 text-red-600 font-medium" : "hover:bg-red-50"}`}
                onClick={() => {
                  setSelectedRecipient(null);
                  setIsMobileSidebarOpen(false);
                }}
              >
                All Recipients
              </button>
            </li>
            {allRecipients.map((recipient, index) => (
              <li key={index}>
                <button
                  className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedRecipient === recipient.recipients ? "bg-red-100 text-red-600 font-medium" : "hover:bg-red-50"}`}
                  onClick={() => {
                    setSelectedRecipient(recipient.recipients);
                    setIsMobileSidebarOpen(false);
                  }}
                >
                  {recipient.recipients}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

const Header = ({ setIsMobileSidebarOpen, searchTerm, setSearchTerm }) => {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm px-4 md:px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors mr-3"
          >
            <SlidersHorizontal size={20} />
          </button>
          
          <div className="flex items-center">
            <Gift size={24} className="text-red-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-800">GiftFinder</h1>
          </div>
        </div>
        
        {/* Search bar - hidden on small screens, visible and right-aligned on desktop */}
        <div className="hidden md:block md:w-1/3 ml-auto mr-4">
          <Search 
            placeholder="Search gifts..." 
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
          <UserCircle size={20} />
        </div>
      </div>
    </div>
  );
};

const SortDropdown = ({ sortOption, setSortOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'priceHigh', label: 'Price: High to Low' },
    { value: 'nameAZ', label: 'Name: A to Z' },
    { value: 'nameZA', label: 'Name: Z to A' }
  ];
  
  const handleSelect = (option) => {
    setSortOption(option);
    setIsOpen(false);
  };
  
  const currentLabel = sortOptions.find(option => option.value === sortOption)?.label || 'Sort By';
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-700 w-48"
      >
        <span className="flex items-center">
          <ArrowUpDown size={16} className="mr-2 text-red-500" />
          {currentLabel}
        </span>
        <ChevronRight size={16} className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-200">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-red-50 ${sortOption === option.value ? 'bg-red-100 text-red-600 font-medium' : 'text-gray-700'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ searchTerm, selectedRecipient }) => (
  <div className="text-center w-full p-8 mt-8">
    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
      <Gift size={32} className="text-red-500" />
    </div>
    <p className="text-gray-700 font-bold text-xl mb-3">
      {searchTerm ? 
        'No gifts match your search' : 
        selectedRecipient ? 
          `No gifts found for ${selectedRecipient}` :
          'No gifts found'}
    </p>
    <p className="text-gray-500 max-w-md mx-auto">
      Try adjusting your filters or explore our other gift categories
    </p>
  </div>
);

export const GiftShopPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { products, loading, error } = useProducts();
  const productsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedRecipient, searchTerm]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-600">
      <p>Error loading products: {error}</p>
    </div>
  );

  const filteredProducts = products.filter(product => {
    const searchMatch = searchTerm.trim() === '' || 
      (product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const categoryMatch = selectedCategory ? product.category.includes(selectedCategory) : true;
    
    const recipientMatch = selectedRecipient ? product.recipients.includes(selectedRecipient) : true;
    
    return searchMatch && categoryMatch && recipientMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      case 'nameAZ':
        return a.title.localeCompare(b.title);
      case 'nameZA':
        return b.title.localeCompare(a.title);
      case 'featured':
      default:
        return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / productsPerPage));
  
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  if (safeCurrentPage !== currentPage) {
    setCurrentPage(safeCurrentPage);
  }
  
  const indexOfLastProduct = safeCurrentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

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
    <div className="bg-gray-50 min-h-screen">
      <Header 
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <div className="relative bg-gradient-to-br from-red-500 to-red-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -right-10 -top-20 w-72 h-72 rounded-full bg-white opacity-10"></div>
          <div className="absolute left-20 bottom-0 w-64 h-64 rounded-full bg-pink-300 opacity-20"></div>
          <div className="absolute right-1/3 top-0 w-48 h-48 rounded-full bg-yellow-200 opacity-10"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm p-3 rounded-full mb-6">
            <Gift size={32} className="text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Find the Perfect Gift
          </h2>
          
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-6">
            Personalized presents for everyone special in your life
          </p>

          {/* Mobile search bar - centered and only visible on mobile */}
          <div className="md:hidden max-w-md mx-auto mt-6">
            <Search 
              placeholder="Search gifts..." 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>
      </div>
      
      <div className="max-w-8xl mx-auto px-4 md:px-8 py-8">
        <div className="flex">
          {/* Desktop sidebar - fixed to the left */}
          <div className="hidden md:block w-64 flex-shrink-0 mr-8">
            <RecipientSidebar 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
              selectedRecipient={selectedRecipient} 
              setSelectedRecipient={setSelectedRecipient}
              isMobileSidebarOpen={isMobileSidebarOpen}
              setIsMobileSidebarOpen={setIsMobileSidebarOpen}
            />
          </div>
          
          {/* Mobile sidebar - rendered separately */}
          <div className="md:hidden">
            <RecipientSidebar 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
              selectedRecipient={selectedRecipient} 
              setSelectedRecipient={setSelectedRecipient}
              isMobileSidebarOpen={isMobileSidebarOpen}
              setIsMobileSidebarOpen={setIsMobileSidebarOpen}
            />
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-0">
                <button 
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="md:hidden bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors flex items-center"
                >
                  <SlidersHorizontal size={16} className="mr-1" />
                  <span className="text-sm">Filters</span>
                </button>
                
                {(selectedCategory || selectedRecipient || searchTerm) && (
                  <span className="text-sm text-gray-500 ml-2">
                    {sortedProducts.length} gift{sortedProducts.length !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>
              
              <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
            </div>
            
            {(selectedCategory || selectedRecipient || searchTerm) && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span className="text-gray-700 font-medium">Active filters:</span>
                
                {selectedCategory && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center">
                    {selectedCategory}
                    <button 
                      className="ml-2 hover:text-red-900" 
                      onClick={() => setSelectedCategory(null)}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {selectedRecipient && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center">
                    For: {selectedRecipient}
                    <button 
                      className="ml-2 hover:text-red-900" 
                      onClick={() => setSelectedRecipient(null)}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {searchTerm && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center">
                    "{searchTerm}"
                    <button 
                      className="ml-2 hover:text-red-900" 
                      onClick={() => setSearchTerm('')}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
            
            {currentProducts.length > 0 ? (
              <>
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10"> */}
                <div className='flex mx-12 flex-wrap gap-6'>
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-16 mb-8">
                    <div className="flex items-center gap-4 bg-white rounded-full shadow-md p-2">
                      <button 
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-100 text-red-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors" 
                        onClick={handlePrevPage} 
                        disabled={currentPage <= 1} 
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      <span className="text-gray-700 font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      
                      <button 
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-100 text-red-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors" 
                        onClick={handleNextPage} 
                        disabled={currentPage >= totalPages} 
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState searchTerm={searchTerm} selectedRecipient={selectedRecipient} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftShopPage;