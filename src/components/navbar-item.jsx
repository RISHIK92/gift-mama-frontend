import FlashSale from "./flash";
import { ProductCard } from "./product";
import { Advert } from "./advert";
import useProducts from "../hooks/useProduct";
import useHomes from "../hooks/useHome";
import useCategory from "../hooks/useCategory";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Search, ChevronRight, Filter, Clock, Truck, Shield, Tag } from "lucide-react";

export function NavbarItem() {
  const { products } = useProducts();
  const { category } = useCategory();
  const { home } = useHomes();
  const { navCategory } = useParams();
  const navigate = useNavigate();
  
  const image = home?.[0]?.advert;
  
  const subCatagories = category
    .filter((e) => e.category === navCategory)
    .flatMap((e) => e.subCategory) || [];
  
  const featuredProducts = products
    .filter((product) => product.category === navCategory)
    .slice(0, 3);
  
  return (
    <div className="bg-white">
      
      <div className="relative h-96 bg-gradient-to-r from-red-600 to-red-400 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-lg">
            <span className="inline-block px-4 py-1 bg-red-700 text-red-100 rounded-lg text-sm font-medium mb-6">
              Discover {navCategory}
            </span>
            <h1 className="text-5xl font-bold text-white mb-8">{navCategory}</h1>
            <div className="flex space-x-4">
              <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-red-50 transition-all">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* <div className="bg-white shadow-md rounded-lg -mt-6 relative z-10 mx-6 lg:mx-12">
        <div className="container mx-auto p-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {subCatagories.length === 0 && (
              <button className="px-6 py-3 rounded-lg bg-gray-50 text-gray-800 font-medium hover:bg-red-50 hover:text-red-600 transition-colors whitespace-nowrap flex-shrink-0">
                All {navCategory}
              </button>
            )}
          </div>
        </div>
      </div> */}
      
      <div className="py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-red-500 to-red-400">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 animate-pulse">
                  <Tag size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Today's Special Offers</h2>
              </div>
              <p className="text-red-100 mb-0">Limited time deals, exclusively for you</p>
            </div>
            
            <div className="p-6">
              <FlashSale description="Flash Sale" />
            </div>
          </div>
        </div>
      </div>
      
      {subCatagories.length > 0 ? (
        <div className="container mx-auto px-6 lg:px-12 py-10">
          {subCatagories.map((subCat, index) => (
            <div key={index} className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">{subCat}</h2>
                  <div className="h-px w-12 bg-red-500"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products
                  .filter((product) => product.subCategory?.includes(subCat) ?? false)
                  .slice(0, 8)
                  .map((product) => (
                    <div key={product.id} className="transform hover:-translate-y-1 transition-transform">
                      <ProductCard product={product} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <div className="bg-white rounded-xl shadow-lg p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={24} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Coming Soon</h3>
            <p className="text-gray-600 max-w-md mx-auto">We're expanding our collection. Check back soon for new {navCategory} products.</p>
          </div>
        </div>
      )}
    <div className="container mx-auto px-6 lg:px-16 py-12">
        <div className="rounded-xl overflow-hidden shadow-lg relative bg-gradient-to-r from-red-500 to-red-500 h-64" onClick={() => navigate('/all')} >
        <div className="absolute inset-0 flex items-center">
        <div className="p-8 md:p-12 max-w-md">
            <span className="inline-block px-4 py-1 bg-white bg-opacity-20 text-white rounded-lg text-sm font-medium mb-4">
                Specials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Exclusive Collection</h2>
            <p className="text-white text-opacity-90 mb-6">Find the perfect gift for every occasion.</p>
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-red-50 transition-all" onClick={(e) => {
                e.stopPropagation(); 
                navigate('/all');
            }}>
                Explore Now
            </button>
        </div>
        </div>
    </div>
    </div>
    </div>
  );
}