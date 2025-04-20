import React, { useState, useEffect } from 'react';
import { Upload, X, Plus, Trash, Info } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../Url';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const CustomizationPreview = ({ productId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({
    unit: 'px',
    width: 200,
    height: 200,
    x: 0,
    y: 0
  });
  const [imageRef, setImageRef] = useState(null);

  // Load product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}products/${productId}/customized-preview`);
        
        setProductDetails({
          id: response.data.id,
          name: response.data.name,
          svgData: response.data.svgData
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading product customization data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);

  const handleImageUpload = async (event) => {
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
    reader.onload = (e) => {
      setSrc(e.target.result);
      // Reset crop when new image is loaded
      setCrop({
        unit: 'px',
        width: 200,
        height: 200,
        x: 0,
        y: 0
      });
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (img) => {
    setImageRef(img);
    // Set initial crop based on image dimensions
    const minDimension = Math.min(img.width, img.height);
    setCrop({
      unit: 'px',
      width: minDimension,
      height: minDimension,
      x: (img.width - minDimension) / 2,
      y: (img.height - minDimension) / 2
    });
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9); // Adjust quality here (0.9 = 90%)
    });
  };

  const handleCropComplete = async () => {
    if (!imageRef || !crop.width || !crop.height) return;

    try {
      const croppedImageBlob = await getCroppedImg(imageRef, crop);
      
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', croppedImageBlob, 'custom-image.jpg');
      formData.append('productId', productId);

      const uploadResponse = await axios.post(
        `${BACKEND_URL}upload/custom-image-direct`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      setCustomImageUrl(uploadResponse.data.imageUrl);
      setSrc(null);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error processing image:', error);
      alert(error.response?.data?.message || 'Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setCustomImageUrl(null);
  };

  const addToCartWithCustomization = async () => {
    try {
      if (!customImageUrl) {
        alert('Please upload an image first');
        return;
      }

      setLoading(true);
      
      const response = await axios.post(
        `${BACKEND_URL}cart/add-customized`,
        {
          productId,
          customizations: [{
            imageUrl: customImageUrl
          }]
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
        {/* Header - Fixed height */}
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
        
        {/* Content Area - Flexible height */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview Area - 60% width */}
          <div className="w-3/5 p-4 flex flex-col">
            <div className="flex items-center mb-2">
              <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
              <h3 className="text-lg font-bold text-gray-800">Preview</h3>
            </div>
            
            <div className="flex-1 border border-red-100 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              {productDetails?.svgData ? (
                <div className="relative w-full h-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    xmlnsXlink="http://www.w3.org/1999/xlink" 
                    viewBox="0 0 1500 2100" 
                    width="100%" 
                    height="100%"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Custom Image Layer */}
                    {customImageUrl && (
                      <image 
                        id="_CustomerImage_" 
                        data-name="CustomerImage" 
                        x="50" 
                        y="34" 
                        width="1415" 
                        height="1415" 
                        xlinkHref={customImageUrl}
                      />
                    )}
                    
                    {/* Base Product Layer */}
                    <image 
                      id="Gift" 
                      width="1500" 
                      height="2100" 
                      xlinkHref={productDetails.svgData}
                    />
                  </svg>
                </div>
              ) : (
                <div className="text-gray-500">Loading preview...</div>
              )}
            </div>
            
            {/* Info box */}
            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs">
              <div className="flex items-center text-red-700">
                <Info className="w-3 h-3 mr-1 flex-shrink-0" />
                <p className="truncate">
                  Requirements: Upload a clear image for your product.
                </p>
              </div>
            </div>
          </div>
          
          {/* Upload Area - 40% width */}
          <div className="w-2/5 p-4 border-l flex flex-col">
            <div className="flex items-center mb-2">
              <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
              <h3 className="text-lg font-bold text-gray-800">Upload Image</h3>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className={`border rounded-lg p-3 h-full flex flex-col ${
                customImageUrl ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}>
                {src ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-hidden">
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        aspect={1}
                        minWidth={100}
                        minHeight={100}
                      >
                        <img
                          src={src}
                          onLoad={(e) => onImageLoad(e.currentTarget)}
                          alt="Upload preview"
                          className="max-w-full max-h-full"
                        />
                      </ReactCrop>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setSrc(null)}
                        className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCropComplete}
                        className="flex-1 py-2 px-3 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                        disabled={isUploading || !crop.width || !crop.height}
                      >
                        {isUploading ? 'Uploading...' : 'Crop & Upload'}
                      </button>
                    </div>
                  </div>
                ) : customImageUrl ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 flex items-center justify-center p-2">
                      <div className="relative w-full max-h-full">
                        <img 
                          src={customImageUrl} 
                          alt="Custom upload" 
                          className="object-contain max-w-full max-h-full mx-auto rounded" 
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="mt-3 py-2 px-3 bg-white border border-red-300 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash className="w-4 h-4" />
                      <span>Remove Image</span>
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <label className="cursor-pointer w-full">
                      <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center hover:border-red-300 transition-colors">
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            Drop image here or click to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG or PNG, max 5MB
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg, image/png"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer - Fixed height */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            {customImageUrl ? (
              <span className="text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Image ready
              </span>
            ) : (
              <span className="text-yellow-600 flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                No image uploaded
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={addToCartWithCustomization}
              className={`px-4 py-2 bg-red-600 text-white rounded text-sm font-medium shadow-sm flex items-center ${
                loading || !customImageUrl ? 'bg-red-400 cursor-not-allowed' : 'hover:bg-red-700'
              }`}
              disabled={loading || !customImageUrl}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPreview;