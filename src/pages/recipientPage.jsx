import FlashSale from "../components/flash";
import { ProductCard } from "../components/product";
import { Advert } from "../components/advert";
import useProducts from "../hooks/useProduct";
import useHomes from "../hooks/useHome";
import useAllCategories from "../hooks/useAllCategories";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Gift,
  ChevronRight,
  Tag,
  ArrowUpDown,
  Filter,
  Heart,
  User,
  Star,
  TrendingUp,
  Sparkles,
  Users,
  Flame,
} from "lucide-react";
import { useState } from "react";
import { useTestimonials } from "../hooks/useTestimonials";

export function RecipientPage() {
  const { products } = useProducts();
  const { home } = useHomes();
  const { allRecipients } = useAllCategories();
  const { recipientName } = useParams();
  const [sortOption, setSortOption] = useState("default");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const navigate = useNavigate();
  const {
    testimonials,
    loading: testimonialsLoading,
    error: testimonialsError,
  } = useTestimonials();

  const image = home?.[0]?.advert;

  const recipientProducts = products.filter(
    (product) => product.recipients?.includes(recipientName) ?? false
  );

  const uniqueSubCategories = [
    ...new Set(
      recipientProducts
        .map((product) => product.subCategory)
        .filter(Boolean)
        .flat()
    ),
  ];

  const filteredProducts =
    selectedSubCategory === "all"
      ? recipientProducts
      : recipientProducts.filter(
          (product) =>
            product.subCategory?.includes(selectedSubCategory) ?? false
        );

  const recipientExists = allRecipients.some(
    (recipient) =>
      recipient.recipients.toLowerCase() === recipientName?.toLowerCase()
  );

  return (
    <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 min-h-screen">
      {/* Hero Section - Red themed with enhanced visual hierarchy */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-red-600 via-rose-500 to-pink-600 relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 animate-pulse"></div>
            <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-white/5"></div>
            <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-red-300/20"></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-rose-300/15 animate-bounce"></div>
          </div>

          <div className="relative z-10 container mx-auto px-6 lg:px-16 py-20 lg:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 border border-white/30">
                <Heart size={16} className="mr-2 text-rose-200" />
                Curated with Love
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                For {recipientName}
                <span className="block text-rose-200 text-3xl md:text-4xl mt-2 font-light">
                  Perfect Gifts Await
                </span>
              </h1>

              <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                Discover heartfelt gifts that spark joy and celebrate the
                special {recipientName} in your life
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center text-white/80 text-sm bg-white/10 rounded-full px-4 py-2">
                  <Flame size={16} className="mr-2 text-orange-300" />
                  {recipientProducts.length} Premium Products
                </div>
                <div className="hidden sm:block w-px h-4 bg-white/30"></div>
                <div className="flex items-center text-white/80 text-sm bg-white/10 rounded-full px-4 py-2">
                  <Sparkles size={16} className="mr-2 text-yellow-300" />
                  Handpicked Collection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Navigation - Red themed pill design */}
      {uniqueSubCategories.length > 0 && (
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-red-100">
          <div className="container mx-auto px-6 lg:px-16 py-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedSubCategory("all")}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSubCategory === "all"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/25 transform scale-105"
                    : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                All Products ({recipientProducts.length})
              </button>
              {uniqueSubCategories.map((category, index) => {
                const count = recipientProducts.filter(
                  (product) => product.subCategory?.includes(category) ?? false
                ).length;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedSubCategory(category)}
                    className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedSubCategory === category
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/25 transform scale-105"
                        : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
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

      {/* Enhanced Main Card Section - Redesigned with red theme */}
      <div className="container mx-auto px-6 lg:px-16 py-12">
        <div className="relative group">
          {/* Main Card Container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100 hover:shadow-red-500/10 transition-all duration-500 transform hover:-translate-y-1">
            {/* Decorative Header with Pattern */}
            <div className="relative bg-gradient-to-r from-red-500 via-rose-400 to-pink-500 overflow-hidden">
              {/* Geometric Pattern Overlay */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="grid grid-cols-12 gap-1 h-full opacity-30">
                    {[...Array(24)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white/20 rounded-sm animate-pulse"
                        style={{ animationDelay: `${i * 50}ms` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Hearts Animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute top-4 left-8 w-4 h-4 text-white/30 animate-bounce"
                  style={{ animationDelay: "0s" }}
                >
                  <Heart size={16} className="fill-current" />
                </div>
                <div
                  className="absolute top-8 right-12 w-3 h-3 text-white/20 animate-bounce"
                  style={{ animationDelay: "1s" }}
                >
                  <Heart size={12} className="fill-current" />
                </div>
                <div
                  className="absolute bottom-6 left-1/3 w-5 h-5 text-white/25 animate-bounce"
                  style={{ animationDelay: "2s" }}
                >
                  <Heart size={20} className="fill-current" />
                </div>
              </div>

              {/* Card Header Content */}
              <div className="relative z-10 p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex items-start mb-6 md:mb-0">
                    <div className="relative mr-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <Gift size={28} className="text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Sparkles size={12} className="text-yellow-800" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-3">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mr-3">
                          Special Gifts
                        </h2>
                        <div className="px-3 py-1 bg-white/20 rounded-full">
                          <span className="text-white text-xs font-medium">
                            PREMIUM
                          </span>
                        </div>
                      </div>
                      <p className="text-white/90 text-lg mb-2">
                        for {recipientName}
                      </p>
                      <div className="flex items-center text-white/70 text-sm">
                        <Star
                          size={14}
                          className="mr-1 fill-current text-yellow-300"
                        />
                        <span>Curated with love & care</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <TrendingUp size={16} className="text-white mr-2" />
                      <span className="text-white text-sm font-medium">
                        Trending
                      </span>
                    </div>
                    <div className="flex items-center text-white/80 text-sm">
                      <Tag size={14} className="mr-2" />
                      Limited Collection
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-2 h-12 bg-gradient-to-b from-red-500 to-rose-500 rounded-full mr-4"></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Discover Perfect Matches
                    </h3>
                    <p className="text-gray-600">
                      Thoughtfully selected for every {recipientName}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center bg-red-50 rounded-full px-4 py-2">
                    <Heart size={16} className="text-red-500 mr-2" />
                    <span className="text-red-700 text-sm font-medium">
                      Loved
                    </span>
                  </div>
                  <div className="flex items-center bg-rose-50 rounded-full px-4 py-2">
                    <Users size={16} className="text-rose-500 mr-2" />
                    <span className="text-rose-700 text-sm font-medium">
                      Popular
                    </span>
                  </div>
                </div>
              </div>

              {/* Flash Sale Component */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100">
                <FlashSale description={`Gifts for ${recipientName}`} />
              </div>
            </div>

            {/* Card Footer with Action */}
            <div className="bg-gray-50 border-t border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Flame size={16} className="text-red-500 mr-2" />
                  <span className="text-sm">Hot deals updated daily</span>
                </div>
                <button className="flex items-center text-red-600 hover:text-red-700 font-medium text-sm transition-colors">
                  View All Offers
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-rose-100 rounded-full opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
        </div>
      </div>

      {/* Products Section - Red themed */}
      {filteredProducts.length > 0 ? (
        <div className="container mx-auto px-6 lg:px-16 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-1 h-12 bg-gradient-to-b from-red-600 to-rose-600 rounded-full mr-6"></div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedSubCategory === "all"
                    ? `Gifts for ${recipientName}`
                    : `${selectedSubCategory} for ${recipientName}`}
                </h2>
                <p className="text-gray-600">
                  {filteredProducts.length} products found
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-red-100 hover:border-red-200 transition-colors">
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
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 transform hover:-translate-y-1">
                View More Products
                <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Enhanced Empty State - Red themed */
        <div className="container mx-auto px-6 lg:px-16 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-red-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No Products Available
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We're currently updating our {recipientName} collection. Please
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

      {/* Enhanced CTA Section - Red themed */}
      <div className="container mx-auto px-6 lg:px-16 py-16">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-red-500 via-rose-400 to-pink-500 cursor-pointer group"
          onClick={() => navigate("/all")}
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-32 -translate-y-32 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-rose-300 transform -translate-x-48 translate-y-48 group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          <div className="relative z-10 p-12 md:p-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6">
                <Heart size={16} className="mr-2" />
                Exclusive Collection
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Find the Perfect Gift for Every {recipientName}
              </h2>

              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                Explore our complete collection of thoughtfully curated gifts
                that celebrate the special {recipientName} in your life.
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

      {/* Enhanced Testimonials Section - Red themed */}
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
            Discover why our {recipientName} gifts are loved by customers across
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
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 border border-red-100 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-6">
                  {testimonial.imageUrl ? (
                    <img
                      src={testimonial.imageUrl}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-red-100"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-rose-100 rounded-full mr-4 flex items-center justify-center">
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
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-red-400" />
            </div>
            <p className="text-gray-500">No testimonials available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
