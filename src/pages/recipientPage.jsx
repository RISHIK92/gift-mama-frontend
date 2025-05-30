import FlashSale from "../components/flash";
import { ProductCard } from "../components/product";
import { Advert } from "../components/advert";
import useProducts from "../hooks/useProduct";
import useHomes from "../hooks/useHome";
import useAllCategories from "../hooks/useAllCategories";
import { useParams } from "react-router-dom";
import {
  ShoppingBag,
  Gift,
  ChevronRight,
  Tag,
  ArrowUpDown,
  Filter,
  Heart,
  User,
} from "lucide-react";
import { useState } from "react";
import { useTestimonials } from "../hooks/useTestimonials";

export function RecipientPage() {
  const { products } = useProducts();
  const { home } = useHomes();
  const { allRecipients } = useAllCategories();
  const { recipientName } = useParams();
  const [sortOption, setSortOption] = useState("default");
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

  const recipientExists = allRecipients.some(
    (recipient) =>
      recipient.recipients.toLowerCase() === recipientName?.toLowerCase()
  );

  return (
    <div className="bg-white">
      {/* Keep the original RecipientPage banner */}
      <div className="relative">
        <div className="bg-red-600 h-72 flex items-center relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-full h-full">
              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <path
                  d="M0,150 L500,40 L500,150 Z"
                  className="fill-red-500"
                ></path>
                <path
                  d="M0,150 L500,100 L500,150 Z"
                  className="fill-red-400 opacity-70"
                ></path>
              </svg>
            </div>
            <div className="absolute right-0 -bottom-10 w-72 h-72 rounded-full bg-red-400 opacity-20"></div>
            <div className="absolute left-20 -top-20 w-72 h-72 rounded-full bg-red-300 opacity-10"></div>
          </div>

          <div className="container mx-auto px-6 lg:px-16 z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="text-left max-w-lg mb-8 md:mb-0">
              <span className="inline-block px-4 py-1 bg-white text-red-600 rounded-lg text-sm font-medium mb-4 shadow-sm">
                Curated Selection
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                For {recipientName}
              </h1>
              <p className="text-white text-opacity-90 text-lg">
                Thoughtfully chosen gifts to delight every {recipientName} in
                your life
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Categories Navigation */}
      {uniqueSubCategories.length > 1 && (
        <div className="container mx-auto px-6 lg:px-16 py-6">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide py-2">
            <button className="whitespace-nowrap px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
              All Products
            </button>
            {uniqueSubCategories.map((category, index) => (
              <button
                key={index}
                className="whitespace-nowrap px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flash Sale Section */}
      <div className="container mx-auto px-6 lg:px-16 pt-8 pb-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-red-500 to-red-400">
            <div className="flex items-center mb-1">
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                <Gift size={16} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Special Gifts for {recipientName}
              </h2>
            </div>
          </div>

          <div className="p-6">
            <FlashSale description={`Gifts for ${recipientName}`} />
          </div>
        </div>
      </div>

      {/* Product Sections */}
      {recipientProducts.length > 0 ? (
        uniqueSubCategories.length > 0 ? (
          <div className="container mx-auto px-6 lg:px-16 py-8">
            {uniqueSubCategories.map((subCat, index) => {
              const subCategoryProducts = recipientProducts.filter(
                (product) => product.subCategory?.includes(subCat) ?? false
              );

              return (
                <div key={index} className="mb-16">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-1 h-8 bg-red-600 mr-4"></div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Specially Curated Gifts for {recipientName}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {subCategoryProducts.map((product) => (
                      <div
                        key={product.id}
                        className="transform hover:-translate-y-1 transition-transform"
                      >
                        <ProductCard
                          product={product}
                          sortOption={sortOption}
                          state={false}
                        />
                      </div>
                    ))}
                  </div>

                  {/* View All button */}
                  {subCategoryProducts.length > 8 && (
                    <div className="text-center mt-8">
                      <button className="inline-flex items-center px-6 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition">
                        View All {subCat}
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="container mx-auto px-6 lg:px-16 py-8">
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-1 h-8 bg-red-600 mr-4"></div>
                  <h2 className="text-2xl font-serif italic text-gray-900">
                    All {recipientName} Gifts
                  </h2>
                </div>
              </div>

              {/* Grid Layout - 4 items per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recipientProducts.map((product) => (
                  <div
                    key={product.id}
                    className="transform hover:-translate-y-1 transition-transform"
                  >
                    <ProductCard product={product} sortOption={sortOption} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="container mx-auto px-6 lg:px-16 py-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-10">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={24} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No Products Available
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're currently updating our {recipientName} collection. Please
              check back soon for exciting new products.
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 lg:px-16 py-12">
        <div className="rounded-xl overflow-hidden shadow-lg relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-700 opacity-60 z-10"></div>
          <div className="absolute z-20 left-0 top-0 w-full h-full flex items-center">
            <div className="p-8 md:p-12 max-w-md">
              <span className="inline-block px-4 py-1 bg-white bg-opacity-20 text-white rounded-lg text-sm font-medium mb-4">
                {recipientName} Specials
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Exclusive Collection
              </h2>
              <p className="text-white text-opacity-90 mb-6">
                Find the perfect gift to celebrate your special {recipientName}.
              </p>
              <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-red-50 transition-all">
                Explore Now
              </button>
            </div>
          </div>
          <div className="w-full">
            <div className="h-56 w-full bg-[#D9D9D9] mt-12 rounded-2xl">
              <div alt="image advert" className="w-full h-56 object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Discover why our {recipientName} gifts are loved by customers across
            the country
          </p>
        </div>
        {testimonialsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          </div>
        ) : testimonialsError ? (
          <div className="text-center py-8 text-red-500">
            Error loading testimonials. Please try again later.
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  {testimonial.imageUrl ? (
                    <img
                      src={testimonial.imageUrl}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-gray-500 text-lg font-medium">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No testimonials available yet.
          </div>
        )}
      </div>
    </div>
  );
}
