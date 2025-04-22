import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Plus, Trash, Info } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../Url';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Shape masking utility
const createShapeMask = (ctx, width, height, shape) => {
  ctx.beginPath();
  
  switch(shape) {
    case 'circle':
      const radius = Math.min(width, height) / 2;
      ctx.arc(width/2, height/2, radius, 0, Math.PI * 2);
      break;
      
    case 'hexagon':
      const centerX = width / 2;
      const centerY = height / 2;
      const sideLength = Math.min(width, height) / 2;
      
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI / 6) - (Math.PI/6);
        const x = centerX + sideLength * Math.cos(angle);
        const y = centerY + sideLength * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      break;
      
    case 'triangle':
      ctx.moveTo(width/2, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      break;
      
    default: // rectangle
      ctx.rect(0, 0, width, height);
  }
  
  ctx.closePath();
  ctx.clip();
};

const CustomizationPreview = ({ productId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [customImages, setCustomImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Load product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}products/${productId}/customized-preview`);
        
        setProductDetails({
          id: response.data.id,
          name: response.data.name,
          svgData: response.data.svgData,
          customizableAreas: response.data.customizableAreas || []
        });
        
        if (response.data.customizableAreas && response.data.customizableAreas.length > 0) {
          setCustomImages(response.data.customizableAreas.map(() => null));
          initCrop(response.data.customizableAreas[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading product customization data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);

  const initCrop = (area) => {
    let aspect;
    let circularCrop = false;
    
    switch (area.shape) {
      case 'circle':
        aspect = 1;
        circularCrop = true;
        break;
      case 'rectangle':
        aspect = area.width / area.height;
        break;
      case 'triangle':
      case 'hexagon':
        aspect = area.width / area.height;
        break;
      default:
        aspect = area.width / area.height;
    }
    
    setCrop({
      unit: '%',
      width: 50,
      aspect,
      circularCrop
    });
  };

  useEffect(() => {
    if (productDetails?.customizableAreas && productDetails.customizableAreas[currentAreaIndex]) {
      initCrop(productDetails.customizableAreas[currentAreaIndex]);
    }
  }, [currentAreaIndex, productDetails]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG or PNG image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result);
      setCompletedCrop(null);
    });
    reader.readAsDataURL(file);
  };

  const applyCustomCrop = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const shape = productDetails.customizableAreas[currentAreaIndex].shape;

    // Set canvas dimensions
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    // Apply shape mask
    createShapeMask(ctx, canvas.width, canvas.height, shape);

    // Calculate scale factors
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Convert to blob and upload
    canvas.toBlob(async (blob) => {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', blob, 'custom-image.png');
        formData.append('productId', productId);
        formData.append('areaIndex', currentAreaIndex);

        const response = await axios.post(
          `${BACKEND_URL}upload/custom-image-direct`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        );

        // Update state with new image
        const newCustomImages = [...customImages];
        newCustomImages[currentAreaIndex] = {
          imageUrl: response.data.imageUrl,
          areaIndex: currentAreaIndex
        };
        setCustomImages(newCustomImages);
        setImageSrc(null);
      } catch (error) {
        console.error('Upload error:', error);
        alert(error.response?.data?.message || 'Failed to process image');
      } finally {
        setIsUploading(false);
      }
    }, 'image/png', 0.95); // 95% quality
  };

  const handleRemoveImage = (areaIndex) => {
    const newCustomImages = [...customImages];
    newCustomImages[areaIndex] = null;
    setCustomImages(newCustomImages);
  };

  const addToCartWithCustomization = async () => {
    try {
      const hasCustomImage = customImages.some(img => img !== null);
      if (!hasCustomImage) {
        alert('Please upload at least one image');
        return;
      }

      setLoading(true);
      
      const customizations = customImages
        .filter(img => img !== null)
        .map((img, index) => ({
          imageUrl: img.imageUrl,
          areaIndex: img.areaIndex
        }));
      
      const response = await axios.post(
        `${BACKEND_URL}cart/add-customized`,
        {
          productId,
          customizations
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      alert("Custom product added to cart!");
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  // Fixed getShapePath function to properly position shapes
  const getShapePath = (shape, width, height, x, y) => {
    // x and y are the top-left coordinates of the shape
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    switch(shape) {
      case 'circle':
        const radius = Math.min(width, height) / 2;
        return `M ${centerX} ${centerY} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius*2},0 a ${radius},${radius} 0 1,0 -${radius*2},0`;
        
      case 'hexagon':
        const sideLength = Math.min(width, height) / 2;
        let path = '';
        for (let i = 0; i < 6; i++) {
          const angle = (i * 2 * Math.PI / 6) - (Math.PI/6);
          const pointX = centerX + sideLength * Math.cos(angle);
          const pointY = centerY + sideLength * Math.sin(angle);
          path += (i === 0 ? 'M' : 'L') + ` ${pointX} ${pointY}`;
        }
        return path + ' Z';
        
      case 'triangle':
        return `M ${centerX} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
        
      default: // rectangle
        return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
    }
  };

  const generateProductSVG = () => {
    if (!productDetails?.svgData) return null;
  
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        xmlnsXlink="http://www.w3.org/1999/xlink" 
        viewBox="0 0 1500 2100" 
        width="100%" 
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        {customImages.map((img, idx) => {
          if (!img) return null;
          
          const area = productDetails.customizableAreas[idx];
          const centerX = area.centerX === 0 ? 750 : area.centerX;  // Default to center if 0
          const centerY = area.centerY === 0 ? 1050 : area.centerY; // Default to center if 0
          const width = area.width || 400;
          const height = area.height || 400;
          
          // Calculate top-left corner for positioning
          const x = centerX - width/2;
          const y = centerY - height/2;
          
          return (
            <g key={`custom-image-${idx}`}>
              <defs>
                <clipPath id={`shape-clip-${idx}`}>
                  <path d={getShapePath(area.shape, width, height, x, y)} />
                </clipPath>
              </defs>
              
              <image 
                x={x}
                y={y}
                width={width}
                height={height}
                xlinkHref={img.imageUrl}
                clipPath={`url(#shape-clip-${idx})`}
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          );
        })}
        
        <image 
          width="1500" 
          height="2100" 
          xlinkHref={productDetails.svgData}
        />
      </svg>
    );
  };

  if (loading && !productDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-lg font-medium text-gray-700">Loading customization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl w-full max-w-5xl shadow-xl flex flex-col" style={{ height: '90vh' }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-red-600 rounded-full mr-2"></div>
            <h2 className="text-xl font-bold text-gray-800 truncate">
              Customize {productDetails?.name || 'Product'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-red-50 text-red-600 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview Area */}
          <div className="w-3/5 p-4 flex flex-col">
            <div className="flex items-center mb-2">
              <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
              <h3 className="text-lg font-bold text-gray-800">Preview</h3>
            </div>
            
            <div className="flex-1 border border-red-100 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              {productDetails?.svgData ? (
                <div className="relative w-full h-full">
                  {generateProductSVG()}
                </div>
              ) : (
                <div className="text-gray-500">Loading preview...</div>
              )}
            </div>
            
            {/* Customizable Areas Selection */}
            {productDetails?.customizableAreas && productDetails.customizableAreas.length > 1 && (
              <div className="mt-3 border-t pt-2">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-4 bg-red-600 rounded-full mr-2"></div>
                  <h4 className="text-sm font-medium text-gray-800">Customizable Areas</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productDetails.customizableAreas.map((area, index) => (
                    <button
                      key={`area-${index}`}
                      onClick={() => setCurrentAreaIndex(index)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        currentAreaIndex === index 
                          ? 'bg-red-100 border border-red-300 text-red-700' 
                          : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>Area {index + 1}</span>
                        {customImages[index] && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Upload Area */}
          <div className="w-2/5 p-4 border-l flex flex-col">
            {productDetails?.customizableAreas && productDetails.customizableAreas.length > 0 && (
              <>
                <div className="flex items-center mb-2">
                  <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {productDetails.customizableAreas.length > 1 
                      ? `Upload Image (Area ${currentAreaIndex + 1})` 
                      : 'Upload Image'}
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className={`border rounded-lg p-3 h-full flex flex-col ${
                    customImages[currentAreaIndex] ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}>
                    {imageSrc ? (
                      <div className="flex flex-col h-full">
                        <div className="mb-3 pb-3 border-b border-gray-200">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Shape: {productDetails.customizableAreas[currentAreaIndex]?.shape.charAt(0).toUpperCase() + 
                                    productDetails.customizableAreas[currentAreaIndex]?.shape.slice(1)}
                          </div>
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center">
                            <ReactCrop
                              crop={crop}
                              onChange={(c) => setCrop(c)}
                              onComplete={(c) => setCompletedCrop(c)}
                              aspect={crop?.aspect}
                              ruleOfThirds
                              circularCrop={productDetails.customizableAreas[currentAreaIndex].shape === 'circle'}
                            >
                              <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imageSrc}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                onLoad={() => {
                                  if (productDetails?.customizableAreas && productDetails.customizableAreas[currentAreaIndex]) {
                                    initCrop(productDetails.customizableAreas[currentAreaIndex]);
                                  }
                                }}
                              />
                            </ReactCrop>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => setImageSrc(null)}
                            className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={applyCustomCrop}
                            className="flex-1 py-2 px-3 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                            disabled={isUploading || !completedCrop}
                          >
                            {isUploading ? 'Uploading...' : 'Apply Image'}
                          </button>
                        </div>
                      </div>
                    ) : customImages[currentAreaIndex] ? (
                      <div className="flex flex-col h-full">
                        <div className="flex-1 flex items-center justify-center p-2">
                          <div className="relative w-full max-h-full">
                            <img 
                              src={customImages[currentAreaIndex].imageUrl} 
                              alt="Custom upload" 
                              className="object-contain max-w-full max-h-full mx-auto rounded" 
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveImage(currentAreaIndex)}
                          className="mt-3 py-2 px-3 bg-white border border-red-300 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash className="w-4 h-4" />
                          <span>Remove Image</span>
                        </button>
                      </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                          <label htmlFor={`file-upload-${currentAreaIndex}`} className="cursor-pointer w-full">
                            <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center hover:border-red-300 transition-colors">
                              <div className="flex flex-col items-center">
                                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                <div className="text-sm font-medium text-gray-700">
                                  Upload an image
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  JPG or PNG, max 5MB
                                </p>
                                <div 
                                  className="mt-4 py-2 px-4 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Select Image
                                </div>
                              </div>
                            </div>
                            <input 
                              id={`file-upload-${currentAreaIndex}`}
                              type="file" 
                              className="hidden" 
                              accept="image/jpeg, image/png"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Upload Status */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
                  <h3 className="text-lg font-bold text-gray-800">Upload Status</h3>
                </div>
              </div>
              
              <div className="border rounded-lg p-3 mb-3">
                {productDetails?.customizableAreas?.map((area, index) => (
                  <div 
                    key={`status-${index}`} 
                    className="flex justify-between items-center py-1.5 border-b last:border-b-0"
                  >
                    <div className="flex items-center text-sm">
                      <span className="font-medium">Area {index + 1}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({area.shape})
                      </span>
                    </div>
                    <div>
                      {customImages[index] ? (
                        <div className="flex items-center bg-green-100 text-green-800 text-xs py-0.5 px-2 rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                          <span>Uploaded</span>
                        </div>
                      ) : (
                        <div className="flex items-center bg-yellow-100 text-yellow-800 text-xs py-0.5 px-2 rounded-full">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></div>
                          <span>Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center bg-gray-50">
          <button 
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          
          <button 
            onClick={addToCartWithCustomization}
            className="py-2 px-6 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors flex items-center"
            disabled={loading || !customImages.some(img => img !== null)}
          >
            {loading ? 'Processing...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPreview;