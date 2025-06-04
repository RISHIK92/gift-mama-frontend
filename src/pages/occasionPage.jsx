import FlashSale from "../components/flash";
import { ProductCard } from "../components/product";
import { Advert } from "../components/advert";
import useProducts from "../hooks/useProduct";
import useHomes from "../hooks/useHome";
import useAllCategories from "../hooks/useAllCategories";
import { useTestimonials } from "../hooks/useTestimonials";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ShoppingBag,
  Gift,
  ChevronRight,
  Tag,
  ArrowUpDown,
  Filter,
  Star,
  Heart,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export function OccasionPage() {
  const { products } = useProducts();
  const { home } = useHomes();
  const { allOccasions } = useAllCategories();
  const {
    testimonials,
    loading: testimonialsLoading,
    error: testimonialsError,
  } = useTestimonials();
  const { occasionName } = useParams();
  const [sortOption, setSortOption] = useState("default");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const navigate = useNavigate();

  const image = home?.[0]?.advert;

  const occasionProducts = products.filter(
    (product) => product.occasion?.includes(occasionName) ?? false
  );

  const uniqueSubCategories = [
    ...new Set(
      occasionProducts
        .map((product) => product.subCategory)
        .filter(Boolean)
        .flat()
    ),
  ];

  const filteredProducts =
    selectedSubCategory === "all"
      ? occasionProducts
      : occasionProducts.filter(
          (product) =>
            product.subCategory?.includes(selectedSubCategory) ?? false
        );

  const occasionExists = allOccasions.some(
    (occasion) =>
      occasion.occasions.toLowerCase() === occasionName?.toLowerCase()
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Hero Section - Enhanced with better visual hierarchy */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-pink-600 relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 animate-pulse"></div>
            <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-white/5"></div>
            <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-pink-300/20"></div>
          </div>

          <div className="relative z-10 container mx-auto px-6 lg:px-16 py-20 lg:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 border border-white/30">
                <Sparkles size={16} className="mr-2" />
                Special Collection
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                {occasionName}
              </h1>

              <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                Discover carefully curated gifts that create unforgettable
                moments for your special {occasionName.toLowerCase()}{" "}
                celebration
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center text-white/80 text-sm">
                  <TrendingUp size={16} className="mr-2" />
                  {occasionProducts.length} Products Available
                </div>
                <div className="hidden sm:block w-px h-4 bg-white/30"></div>
                <div className="flex items-center text-white/80 text-sm">
                  <Heart size={16} className="mr-2" />
                  Handpicked Collection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Navigation - Modern pill design */}
      {uniqueSubCategories.length > 0 && (
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="container mx-auto px-6 lg:px-16 py-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedSubCategory("all")}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSubCategory === "all"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                All Products ({occasionProducts.length})
              </button>
              {uniqueSubCategories.map((category, index) => {
                const count = occasionProducts.filter(
                  (product) => product.subCategory?.includes(category) ?? false
                ).length;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedSubCategory(category)}
                    className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedSubCategory === category
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Flash Sale Section - Enhanced card design */}
      <div className="container mx-auto px-6 lg:px-16 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-red-500 via-red-400 to-pink-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4">
                  <Gift size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Special Gifts for {occasionName}
                  </h2>
                  <p className="text-white/80 text-sm">Limited time offers</p>
                </div>
              </div>
              <div className="hidden md:flex items-center text-white/80 text-sm">
                <Tag size={16} className="mr-2" />
                Exclusive Deals
              </div>
            </div>
          </div>

          <div className="p-8">
            <FlashSale description={`Gifts for ${occasionName}`} />
          </div>
        </div>
      </div>

      {/* Products Section - Enhanced grid layout */}
      {filteredProducts.length > 0 ? (
        <div className="container mx-auto px-6 lg:px-16 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-1 h-12 bg-gradient-to-b from-red-600 to-pink-600 rounded-full mr-6"></div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedSubCategory === "all"
                    ? `All ${occasionName} Gifts`
                    : `${selectedSubCategory} for ${occasionName}`}
                </h2>
                <p className="text-gray-600">
                  {filteredProducts.length} products found
                </p>
              </div>
            </div>

            {/* Sort Options - Enhanced dropdown */}
          </div>

          {/* Enhanced Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 transition-colors">
                  <ProductCard
                    product={product}
                    sortOption={sortOption}
                    state={false}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {filteredProducts.length > 12 && (
            <div className="text-center mt-12">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 transform hover:-translate-y-1">
                View More Products
                <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Enhanced Empty State */
        <div className="container mx-auto px-6 lg:px-16 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No Products Available
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We're currently updating our {occasionName} collection. Please
                check back soon for exciting new products.
              </p>
              <button
                onClick={() => navigate("/all")}
                className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Browse All Products
                <ChevronRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CTA Section */}
      <div className="container mx-auto px-6 lg:px-16 py-16">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-red-500 via-red-400 to-pink-500 cursor-pointer group"
          onClick={() => navigate("/all")}
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-32 -translate-y-32 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-pink-300 transform -translate-x-48 translate-y-48 group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          <div className="relative z-10 p-12 md:p-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} className="mr-2" />
                Exclusive Collection
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Discover More Amazing Gifts
              </h2>

              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                Explore our complete collection of handpicked gifts for every
                occasion and create unforgettable moments.
              </p>

              <button
                className="inline-flex items-center bg-white text-red-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/all");
                }}
              >
                Explore Collection
                <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Testimonials Section */}
      <div className="container mx-auto px-6 lg:px-16 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium mb-6">
            <Star size={16} className="mr-2" />
            Customer Reviews
          </div>
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover why our {occasionName} gifts are loved by customers across
            the country
          </p>
        </div>

        {testimonialsLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading testimonials...</p>
          </div>
        ) : testimonialsError ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">⚠</span>
            </div>
            <p className="text-red-500 font-medium">
              Error loading testimonials. Please try again later.
            </p>
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-6">
                  {testimonial.imageUrl ? (
                    <img
                      src={testimonial.imageUrl}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-red-600 text-xl font-bold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {testimonial.name}
                    </h4>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No testimonials available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
