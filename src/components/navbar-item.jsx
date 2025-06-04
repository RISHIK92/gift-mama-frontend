import FlashSale from "./flash";
import { ProductCard } from "./product";
import { Advert } from "./advert";
import useProducts from "../hooks/useProduct";
import useHomes from "../hooks/useHome";
import useCategory from "../hooks/useCategory";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ShoppingBag,
  Heart,
  Search,
  ChevronRight,
  Filter,
  Clock,
  Truck,
  Shield,
  Tag,
  Sparkles,
  TrendingUp,
  Star,
  Grid3x3,
  Zap,
} from "lucide-react";

export function NavbarItem() {
  const { products, loading: productsLoading } = useProducts();
  const { category, loading: categoryLoading } = useCategory();
  const { home, loading: homeLoading } = useHomes();
  const { navCategory } = useParams();
  const navigate = useNavigate();
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [sortOption, setSortOption] = useState("default");

  const image = home?.[0]?.advert;

  const subCategories =
    category
      .filter((e) => e.category === navCategory)
      .flatMap((e) => e.subCategory) || [];

  const categoryProducts = products.filter((product) =>
    product.category.includes(navCategory)
  );

  const filteredProducts =
    selectedSubCategory === "all"
      ? categoryProducts
      : categoryProducts.filter(
          (product) =>
            product.subCategory?.includes(selectedSubCategory) ?? false
        );

  const featuredProducts = categoryProducts.slice(0, 6);

  if (productsLoading || categoryLoading || homeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-pink-600 relative">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 animate-pulse"></div>
            <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-pink-300/20"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full bg-white/5 transform -translate-x-1/2 translate-y-1/2"></div>

            {/* Geometric Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="hexagons"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <polygon
                      points="10,1 20,6 20,14 10,19 0,14 0,6"
                      fill="none"
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#hexagons)" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 container mx-auto px-6 lg:px-16 py-20 lg:py-32">
            <div className="max-w-4xl">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8 border border-white/30">
                <Grid3x3 size={16} className="mr-2" />
                Discover {navCategory}
              </div>

              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight">
                {navCategory}
              </h1>

              <p className="text-white/90 text-xl md:text-2xl max-w-2xl mb-10 leading-relaxed">
                Explore our premium collection of {navCategory?.toLowerCase()}{" "}
                products, carefully curated for quality and style.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
                <button
                  onClick={() =>
                    document
                      .getElementById("products-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center bg-white text-red-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1"
                >
                  <ShoppingBag size={20} className="mr-2" />
                  Shop Collection
                </button>

                <div className="flex items-center gap-6 text-white/80 text-sm">
                  <div className="flex items-center">
                    <TrendingUp size={16} className="mr-2" />
                    {categoryProducts.length} Products
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-white/30"></div>
                  <div className="flex items-center">
                    <Star size={16} className="mr-2" />
                    Premium Quality
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory Filter Navigation */}
      {subCategories.length > 0 && (
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
                All {navCategory} ({categoryProducts.length})
              </button>
              {subCategories.map((subCat, index) => {
                const count = categoryProducts.filter(
                  (product) => product.subCategory?.includes(subCat) ?? false
                ).length;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedSubCategory(subCat)}
                    className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedSubCategory === subCat
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {subCat} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Flash Sale Section */}
      <div className="container mx-auto px-6 lg:px-16 py-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-red-500 via-red-400 to-pink-500 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-6 animate-pulse">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Today's Special Offers
                  </h2>
                  <p className="text-white/80 text-lg">
                    Limited time deals, exclusively for you
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center text-white/80">
                <Clock size={20} className="mr-2" />
                <span className="text-sm font-medium">Ends Soon</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <FlashSale description={`${navCategory} Flash Sale`} />
          </div>
        </div>
      </div>

      {/* Enhanced Products Section */}
      <div id="products-section">
        {filteredProducts.length > 0 ? (
          <div className="container mx-auto px-6 lg:px-16 pb-16">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center">
                <div className="w-1 h-16 bg-gradient-to-b from-red-600 to-pink-600 rounded-full mr-6"></div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    {selectedSubCategory === "all"
                      ? navCategory
                      : selectedSubCategory}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {filteredProducts.length} premium products found
                  </p>
                </div>
              </div>
            </div>

            {subCategories.length > 0 && selectedSubCategory === "all" ? (
              // Group by subcategory when showing all
              subCategories.map((subCat, index) => {
                const subCategoryProducts = categoryProducts.filter(
                  (product) => product.subCategory?.includes(subCat) ?? false
                );

                if (subCategoryProducts.length === 0) return null;

                return (
                  <div key={index} className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold text-gray-900 mr-4">
                          {subCat}
                        </h3>
                        <div className="h-px w-16 bg-gradient-to-r from-red-500 to-pink-500"></div>
                      </div>

                      <button
                        onClick={() => setSelectedSubCategory(subCat)}
                        className="text-red-600 hover:text-red-700 font-medium flex items-center"
                      >
                        View All
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {subCategoryProducts
                        .slice(0, 8)
                        .map((product, productIndex) => (
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
                  </div>
                );
              })
            ) : (
              // Show filtered products - Fixed the ProductCard call here
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
            )}
          </div>
        ) : (
          /* Enhanced Empty State */
          <div className="container mx-auto px-6 lg:px-16 py-20">
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-white rounded-3xl shadow-xl p-16 border border-gray-100">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mx-auto mb-8">
                  <ShoppingBag size={40} className="text-red-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Coming Soon
                </h3>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  We're expanding our {navCategory} collection with amazing new
                  products. Check back soon for exciting updates!
                </p>
                <button
                  onClick={() => navigate("/all")}
                  className="inline-flex items-center px-8 py-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Explore Other Categories
                  <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced CTA Section */}
      <div className="container mx-auto px-6 lg:px-16 py-16">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
          onClick={() => navigate("/all")}
        >
          <div className="bg-gradient-to-br from-red-500 via-red-400 to-pink-500 relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 transform translate-x-40 -translate-y-40 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-pink-300/20 transform -translate-x-48 translate-y-48 group-hover:scale-110 transition-transform duration-700"></div>
            </div>

            <div className="relative z-10 p-12 md:p-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6">
                  <Sparkles size={16} className="mr-2" />
                  Exclusive Collection
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Discover More Amazing Products
                </h2>

                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  Explore our complete range of premium products across all
                  categories and find exactly what you're looking for.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="inline-flex items-center bg-white text-red-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/all");
                    }}
                  >
                    Explore All Products
                    <ChevronRight size={20} className="ml-2" />
                  </button>

                  <button
                    className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold border border-white/30 hover:bg-white/30 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/categories");
                    }}
                  >
                    <Grid3x3 size={20} className="mr-2" />
                    Browse Categories
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
