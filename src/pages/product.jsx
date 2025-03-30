import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/product';
import { CheckCircle, Expand, Eye, ShoppingCart, X, ChevronLeft, ChevronRight, Plus, Info } from 'lucide-react';
import { Heart } from 'lucide-react';
import { FlashSale } from '../components/flash';
import useProducts from '../hooks/useProduct';
import { BACKEND_URL } from '../Url';
import CustomizedPreviewModal from '../components/custompreview';

const ImageModal = ({ images, currentIndex, onClose, onChangeImage }) => {
  const modalContentRef = useRef(null);
  
  if (!images || images.length === 0) return null;
  
  const mainImage = images[0].mainImage;
  const subImages = images[0].subImages || [];
  const allImages = [mainImage, ...subImages];
  
  const handlePrev = (e) => {
    e.stopPropagation();
    onChangeImage(currentIndex === 0 ? allImages.length - 1 : currentIndex - 1);
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    onChangeImage(currentIndex === allImages.length - 1 ? 0 : currentIndex + 1);
  };

  const handleBackdropClick = (e) => {
    // Close modal only if the click was on the backdrop (outside modal content)
    if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" 
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalContentRef}
        className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-4">
          <div className="relative w-full h-[500px] mb-4">
            <img 
              src={allImages[currentIndex]} 
              alt="Product view" 
              className="w-full h-full object-contain"
            />
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {allImages.map((img, idx) => (
              <div 
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeImage(idx);
                }}
                className={`w-[100px] h-[100px] rounded-md overflow-hidden cursor-pointer ${currentIndex === idx ? 'ring-2 ring-[#FF3B3B]' : 'opacity-70'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductSkeleton = () => {
  return (
    <div className="py-8 animate-pulse">
      <div className="flex flex-col md:flex-row mb-8 px-4 md:ml-32 md:px-0">
        <div className="md:w-1/2">
          <div className="relative rounded-md overflow-hidden w-full md:w-[500px] h-[300px] md:h-[500px] bg-gray-200"></div>
          <div className="flex gap-3 mt-4 overflow-x-auto md:overflow-visible">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[100px] h-[100px] md:w-[160px] md:h-[160px] rounded-md bg-gray-200 flex-shrink-0"></div>
            ))}
          </div>
        </div>

        <div className="md:px-12 lg:px-32 mt-8 md:mt-0 md:w-3/4">
          <div className="flex gap-2 mb-1">
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-20 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
          </div>
          
          <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
          
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
          </div>
          
          <div className="mb-6">
            <div className="h-6 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="flex items-center">
              <div className="w-28 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="h-12 w-full bg-gray-200 rounded-2xl"></div>
            <div className="h-12 w-full bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>

      <div className="my-12 mx-4 md:ml-20 mt-24 md:mr-20">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full h-[350px] bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Requirements Modal Component
const RequirementsModal = ({ onClose }) => {
  const modalContentRef = useRef(null);

  const handleBackdropClick = (e) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" 
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalContentRef}
        className="relative bg-white rounded-lg max-w-lg w-full overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Image Requirements</h2>
            <button 
              onClick={onClose}
              className="bg-gray-200 rounded-full p-1 hover:bg-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Main Product Image</h3>
              <ul className="list-disc ml-5 space-y-1 text-gray-700">
                <li>Required resolution: 1000 x 1000 pixels (minimum)</li>
                <li>Format: JPG or PNG</li>
                <li>Maximum file size: 5MB</li>
                <li>Background: White or transparent</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Additional Images</h3>
              <ul className="list-disc ml-5 space-y-1 text-gray-700">
                <li>Number of images: Up to 5 additional images</li>
                <li>Required resolution: 800 x 800 pixels (minimum)</li>
                <li>Format: JPG or PNG</li>
                <li>Maximum file size: 3MB per image</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Pro tip:</span> For best display quality, use square images with consistent lighting and focus on product details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { productId } = useParams();
  const {products} = useProducts();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}products/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    // Handle ESC key to close modals
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (showRequirementsModal) setShowRequirementsModal(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    
    // Prevent body scroll when modals are open
    if (showModal || showRequirementsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [showModal, showRequirementsModal]);

  if (loading) return <ProductSkeleton />;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  const addToCart = async (e) => {
    e.stopPropagation();
    try {
        setCartLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            navigate('/login');
            return;
        }
        
        const response = await fetch(`${BACKEND_URL}cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: product.id,
                quantity: quantity
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to add item to cart');
        }
        
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 1000); 
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert(`Error: ${error.message}`);
    } finally {
      setCartLoading(false);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setShowModal(true);
  };

  const getAllImages = () => {
    if (!product.images || product.images.length === 0) return [];
    const mainImage = product.images[0].mainImage;
    const subImages = product.images[0].subImages || [];
    return [mainImage, ...subImages];
  };
  
  const hasMoreImages = product.images?.[0]?.subImages?.length > 2;
  
  // Get visible sub-images (limited to 2 if more than 3 total images including main)
  const visibleSubImages = product.images?.[0]?.subImages?.slice(0, 2) || [];

  return (
    <>
      <div className="py-8">
        <div className="flex flex-col md:flex-row mb-8 px-4 md:ml-32 md:px-0">
          <div className="">
            <div 
              className="relative group rounded-md overflow-hidden w-full md:w-[500px] h-[300px] md:h-[500px] cursor-pointer"
              onClick={() => openModal(0)}
            >
              <img 
                src={product.images?.[0]?.mainImage} 
                className="w-full h-full object-cover bg-gray-400 rounded-md" 
                alt={product.name} 
              />
              <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  className="p-2 bg-[#FF3B3B] rounded-full hover:bg-red-400 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(0);
                  }}
                >
                  <Expand className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 bg-[#FF3B3B] rounded-full hover:bg-red-400 transition">
                  <Heart className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4 overflow-x-auto md:overflow-visible">
              {/* Show only first 2 sub-images */}
              {visibleSubImages.map((src, index) => (
                <div 
                  key={index} 
                  className="w-[100px] h-[100px] md:w-[160px] md:h-[160px] rounded-md bg-gray-400 overflow-hidden cursor-pointer"
                  onClick={() => openModal(index + 1)} // +1 because index 0 is the main image
                >
                  <img src={src} className="w-full h-full object-cover" alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
              
              {/* "+ more" button if there are more than 3 images total */}
              {hasMoreImages && (
                <div 
                  className="w-[100px] h-[100px] md:w-[160px] md:h-[160px] rounded-md bg-gray-200 overflow-hidden cursor-pointer flex items-center justify-center"
                  onClick={() => openModal(2)} // Open modal starting from the 3rd image (index 2)
                >
                  <div className="flex flex-col items-center justify-center text-gray-600">
                    <Plus className="w-8 h-8" />
                    <span className="text-sm font-medium mt-1">
                      {product.images?.[0]?.subImages?.length - 2} more
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:px-12 lg:px-32 mt-8 md:mt-0 md:w-3/4">
            <div className="text-sm text-gray-500 mb-1 flex flex-wrap gap-2">
              {product?.categories.map((category, index) => (
                <span key={index} className="bg-gray-300 px-2 py-1 rounded">{category}</span>
              ))}
            </div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-semibold">₹{product.price - product.price*(product.discount/100)}</span>
              {product.price && (
                <>
                  <span className="text-gray-500 line-through text-sm">₹{product.price}</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {Math.round(product.discount)}% Off
                  </span>
                </>
              )}
            </div>
            
            <div className="text-sm text-gray-500 mb-4">Inclusive of all taxes</div>
            <p className="text-gray-700 mb-6">{product.description}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempus magna et molestie rutrum, ac tincidunt ante tortor at. Cras nec lacus dui. Curabitur in dui eget orci luctus pellentesque. Maecenas ultricies, metus ut ullamcorper tempor, augue nibh ultrices justo, non pharetra ex urna elementum sem. Etiam aliquam enim vitae lectus commodo, in malesuada elit pretium viverra. Phasellus vel dui luctus, tempus leo a, commodo nulla. Cras feugiat ligula porttitor malesuada tincidunt. Sed dui quam, pharetra et efficitur sed, lacinia sit amet velit.
            </p>
            
            <div className="mb-6">
              <label className="block mb-2">Quantity</label>
              <div className="flex items-center">
                <button onClick={handleDecrement} className="w-8 h-8 border border-gray-300 flex items-center justify-center rounded-l">
                  -
                </button>
                <div className="w-12 h-8 border-t border-b border-gray-300 flex items-center justify-center">{quantity}</div>
                <button onClick={handleIncrement} className="w-8 h-8 border border-gray-300 flex items-center justify-center rounded-r">
                  +
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 flex-col sm:flex-row">
            <button 
                className="bg-[#FF3B3B] hover:bg-red-600 text-white py-3 px-5 rounded-2xl flex-1 flex items-center justify-center text-sm font-medium gap-2"
                onClick={() => setShowCustomizeModal(true)}
              >
                <span><Eye /></span> Customized Preview
              </button>
              {showCustomizeModal && (
                <CustomizedPreviewModal
                  productId={product.id}
                  onClose={() => setShowCustomizeModal(false)}
                />
              )}
              <button
                className="bg-[#FF3B3B] hover:bg-red-600 text-white py-3 px-5 rounded-2xl flex-1 flex items-center justify-center text-sm font-medium gap-2"
                onClick={addToCart}
                disabled={cartLoading || cartSuccess}
              >
                {cartLoading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                ) : cartSuccess ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                    <span>
                        <ShoppingCart />
                    </span>
                )}
                {cartLoading ? "Adding..." : cartSuccess ? "Added!" : "Add to Cart"}
              </button>
            </div>
            {/* Image Requirements Section */}
            {product.requirements && <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Images Requirement</h3>
                {/* <button 
                  onClick={() => setShowRequirementsModal(true)}
                  className="text-blue-600 flex items-center gap-1 hover:text-blue-800"
                >
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Details</span>
                </button> */}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{product.requirements}</div>
              </div>
            </div>}
          </div>
        </div>
        

        <FlashSale description="Offers you don't wanna miss. Flash sale!" />
        <div className="my-12 mx-4 md:ml-20 mt-24 md:mr-20">
          <h2 className="text-2xl font-serif italic mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-20">
            {products.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <ImageModal 
          images={product.images}
          currentIndex={currentImageIndex}
          onClose={() => setShowModal(false)}
          onChangeImage={setCurrentImageIndex}
        />
      )}

      {showRequirementsModal && (
        <RequirementsModal onClose={() => setShowRequirementsModal(false)} />
      )}
    </>
  );
};

export default ProductPage;