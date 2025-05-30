import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Plus, Trash, Info, Image, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../Url';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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

const getShapePath = (shape, width, height, x, y) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Fix for handling "retangle" typo from API
  const normalizedShape = shape === 'retangle' ? 'rectangle' : shape;
  
  switch(normalizedShape) {
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

const CustomizationPreview = ({ productId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  
  // Templates 
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [customImages, setCustomImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const svgContainerRef = useRef(null);
  const token = localStorage.getItem('token');

  // Load product data and templates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productResponse = await axios.get(
          `${BACKEND_URL}products/${productId}/customized-preview`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        setProductDetails({
          id: productResponse.data.id,
          name: productResponse.data.name,
        });
        
        // Fetch templates for the product
        try {
          const templatesResponse = await axios.get(`${BACKEND_URL}products/${productId}/templates`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setTemplates(templatesResponse.data);
          
          // Set initial template
          if (templatesResponse.data.length > 0) {
            const firstTemplate = templatesResponse.data[0];
            setSelectedTemplate(firstTemplate);
            
            // Initialize customImages array for the template's customizable areas
            // Handle case where template has no customizable areas
            const areaCount = firstTemplate.customizableAreas?.length || 0;
            setCustomImages(Array(areaCount).fill(null));
            
            // Only initialize crop if there are customizable areas
            if (areaCount > 0) {
              initCrop(firstTemplate.customizableAreas[0]);
            }
          }
        } catch (err) {
          console.error(`Error fetching templates:`, err);
          setTemplates([]);
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

  // Initialize crop when template or area changes
  const initCrop = (area) => {
    if (!area) return;
    
    let aspect;
    let circularCrop = false;
    
    // Fix for handling "retangle" typo from API
    const normalizedShape = area.shape === 'retangle' ? 'rectangle' : area.shape;
    
    switch (normalizedShape) {
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

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    // Handle case where template has no customizable areas
    const areaCount = template.customizableAreas?.length || 0;
    setCustomImages(Array(areaCount).fill(null));
    
    // Reset current area index
    setCurrentAreaIndex(0);
    
    // Only initialize crop if there are customizable areas
    if (areaCount > 0) {
      initCrop(template.customizableAreas[0]);
    }
    
    // Reset any active image cropping
    setImageSrc(null);
    setCompletedCrop(null);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const currentArea = selectedTemplate.customizableAreas[currentAreaIndex];
    const validTypes = currentArea.allowedFormats || ['image/jpeg', 'image/png'];
    
    if (!validTypes.includes(file.type)) {
      alert(`Please upload a ${validTypes.map(f => f.split('/')[1].toUpperCase()).join(' or ')} image`);
      return;
    }

    const maxSize = (currentArea.maxFileSizeMB || 5) * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Image size should be less than ${currentArea.maxFileSizeMB || 5}MB`);
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
    if (!completedCrop || !imgRef.current || !selectedTemplate) return;
  
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const area = selectedTemplate.customizableAreas[currentAreaIndex];
    
    // Fix for handling "retangle" typo from API and ensure shape is defined
    const shape = area.shape === 'retangle' ? 'rectangle' : (area.shape || 'rectangle');
  
    // Set canvas dimensions - ensure they're valid numbers
    const cropWidth = Math.max(1, Math.round(completedCrop.width));
    const cropHeight = Math.max(1, Math.round(completedCrop.height));
    canvas.width = cropWidth;
    canvas.height = cropHeight;
  
    // Apply shape mask
    createShapeMask(ctx, canvas.width, canvas.height, shape);
  
    // Calculate scale factors
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
  
    // Calculate source dimensions - ensure they're within bounds
    const srcX = Math.max(0, Math.round(completedCrop.x * scaleX));
    const srcY = Math.max(0, Math.round(completedCrop.y * scaleY));
    const srcWidth = Math.min(
      image.naturalWidth - srcX, 
      Math.round(completedCrop.width * scaleX)
    );
    const srcHeight = Math.min(
      image.naturalHeight - srcY, 
      Math.round(completedCrop.height * scaleY)
    );
  
    // Draw the cropped image
    ctx.drawImage(
      image,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
  
    // Convert to blob and upload
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas');
        return;
      }
  
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', blob, 'custom-image.png');
        formData.append('productId', productId);
        formData.append('templateId', selectedTemplate.id);
        formData.append('areaId', area.id);
        formData.append('width', cropWidth);
        formData.append('height', cropHeight);
        formData.append('shape', shape);
  
        const response = await axios.post(
          `${BACKEND_URL}upload/custom-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
  
        // Update state with new image
        const newCustomImages = [...customImages];
        newCustomImages[currentAreaIndex] = response.data;
        setCustomImages(newCustomImages);
        setImageSrc(null);
      } catch (error) {
        console.error('Upload error:', error);
        alert(error.response?.data?.message || 'Failed to process image');
      } finally {
        setIsUploading(false);
      }
    }, 'image/png', 0.95);
  };

  // Add to cart with customizations
  const addToCartWithCustomization = async () => {
    try {
      // Only check for custom images if the template has customizable areas
      const hasCustomizableAreas = selectedTemplate?.customizableAreas?.length > 0;
      
      if (hasCustomizableAreas) {
        const hasCustomImage = customImages.some(img => img !== null);
        if (!hasCustomImage) {
          alert('Please upload at least one image');
          return;
        }
      }

      setLoading(true);
      
      // Create cart item with template ID
      const cartData = {
        productId,
        customTemplateId: selectedTemplate.id
      };
      
      // First create cart item
      const cartResponse = await axios.post(
        `${BACKEND_URL}cart/add-customized`,
        cartData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Only link uploads if there are custom images
      if (customImages.length > 0) {
        // Get all uploaded image IDs
        const uploadIds = customImages
          .filter(img => img !== null)
          .map(img => img.id);
        
        if (uploadIds.length > 0) {
          // Then associate uploads with cart item
          await axios.post(
            `${BACKEND_URL}cart/${cartResponse.data.id}/link-uploads`,
            { uploadIds },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
        }
      }
      
      alert("Custom product added to cart!");
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle image load event
  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;
  };

  // Function to remove uploaded image
  const removeImage = (index) => {
    const newCustomImages = [...customImages];
    newCustomImages[index] = null;
    setCustomImages(newCustomImages);
  };

  // Function to cancel current crop
  const cancelCrop = () => {
    setImageSrc(null);
    setCompletedCrop(null);
  };

  // Navigate between customizable areas
  const navigateArea = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentAreaIndex + 1) % customImages.length
      : (currentAreaIndex - 1 + customImages.length) % customImages.length;
    
    setCurrentAreaIndex(newIndex);
    initCrop(selectedTemplate.customizableAreas[newIndex]);
  };

  const generateProductSVG = () => {
    if (!selectedTemplate || !selectedTemplate.svgData) return null;
  
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        xmlnsXlink="http://www.w3.org/1999/xlink" 
        viewBox="0 0 1500 2100" 
        width="100%" 
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: '100%', objectFit: 'contain' }}
      >
        {/* Base template image - Use URL directly from template */}
        <image 
          width="1500" 
          height="2100" 
          xlinkHref={selectedTemplate.svgData}
        />
        
        {/* Custom images */}
        {customImages.map((img, idx) => {
          if (!img || !selectedTemplate.customizableAreas[idx]) return null;
          
          const area = selectedTemplate.customizableAreas[idx];
          const centerX = area.centerX || 750;
          const centerY = area.centerY || 1050;
          const width = area.width || 400;
          const height = area.height || 400;
          const x = centerX - width/2;
          const y = centerY - height/2;
          
          // Fix for handling "retangle" typo from API
          const normalizedShape = area.shape === 'retangle' ? 'rectangle' : area.shape;
          
          return (
            <g key={`custom-image-${idx}`}>
              <defs>
                <clipPath id={`shape-clip-${idx}`}>
                  <path d={getShapePath(normalizedShape, width, height, x, y)} />
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
                transform={`
                  rotate(${img.rotation || 0} ${centerX} ${centerY})
                  scale(${img.scale || 1})
                  translate(${img.positionX || 0} ${img.positionY || 0})
                `}
              />
            </g>
          );
        })}
      </svg>
    );
  };

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
          <button onClick={onClose} className="p-1 hover:bg-red-50 text-red-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Preview Area */}
          <div className="w-full md:w-3/5 p-4 flex flex-col">
            {/* Template Selection */}
            {templates.length > 1 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
                  <h3 className="text-lg font-bold text-gray-800">Design Templates</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`flex-shrink-0 p-2 border rounded-lg ${
                        selectedTemplate?.id === template.id 
                          ? 'border-red-400 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs font-medium mt-1 truncate">{template.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center mb-2">
              <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
              <h3 className="text-lg font-bold text-gray-800">Preview</h3>
            </div>
            
            <div 
              className="flex-1 border border-red-100 rounded-lg bg-white flex items-center justify-center overflow-hidden"
              ref={svgContainerRef}
            >
              {selectedTemplate ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {generateProductSVG()}
                </div>
              ) : (
                <div className="text-gray-500">
                  Select a template to preview
                </div>
              )}
            </div>
            
            {/* Customizable Areas Selection - Only show if template has areas */}
            {selectedTemplate?.customizableAreas && selectedTemplate.customizableAreas.length > 0 && (
              <div className="mt-3 border-t pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-1 h-4 bg-red-600 rounded-full mr-2"></div>
                    <h4 className="text-sm font-medium text-gray-800">Customizable Areas</h4>
                  </div>
                  {customImages.length > 1 && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigateArea('prev')}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        disabled={currentAreaIndex === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigateArea('next')}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        disabled={currentAreaIndex === customImages.length - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.customizableAreas.map((area, index) => (
                    <button
                      key={`area-${index}`}
                      onClick={() => {
                        setCurrentAreaIndex(index);
                        initCrop(selectedTemplate.customizableAreas[index]);
                      }}
                      className={`px-3 py-1 text-xs rounded-full ${
                        currentAreaIndex === index 
                          ? 'bg-red-100 border border-red-300 text-red-700' 
                          : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{area.name || `Area ${index + 1}`}</span>
                        {customImages[index] && (
                          <Check className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Upload Area */}
          <div className="w-full md:w-2/5 p-4 border-t md:border-t-0 md:border-l flex flex-col">
            {selectedTemplate?.customizableAreas && selectedTemplate.customizableAreas.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-1 h-5 bg-red-600 rounded-full mr-2"></div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {selectedTemplate.customizableAreas[currentAreaIndex]?.name || 
                      (selectedTemplate.customizableAreas.length > 1 
                        ? `Upload Image (Area ${currentAreaIndex + 1})` 
                        : 'Upload Image')}
                    </h3>
                  </div>
                  {customImages.length > 1 && (
                    <div className="flex gap-1 md:hidden">
                      <button 
                        onClick={() => navigateArea('prev')}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        disabled={currentAreaIndex === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigateArea('next')}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        disabled={currentAreaIndex === customImages.length - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {selectedTemplate.customizableAreas[currentAreaIndex]?.description && (
                  <div className="mb-3 text-sm text-gray-600 bg-blue-50 p-2 rounded flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{selectedTemplate.customizableAreas[currentAreaIndex].description}</span>
                  </div>
                )}
                
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* If image is being cropped */}
                  {imageSrc ? (
                    <div className="flex-1 flex flex-col">
                      <div className="mb-2 text-sm bg-yellow-50 p-2 rounded flex gap-1 items-center">
                        <Info className="w-4 h-4 text-yellow-600" />
                        <span>Drag to adjust the crop area for your image</span>
                      </div>
                      
                      <div className="flex-1 overflow-auto mb-3 bg-gray-100 flex items-center justify-center">
                        <ReactCrop
                          crop={crop}
                          onChange={(c) => setCrop(c)}
                          onComplete={(c) => setCompletedCrop(c)}
                          aspect={crop?.aspect}
                          circularCrop={crop?.circularCrop}
                        >
                          <img
                            ref={imgRef}
                            alt="Crop preview"
                            src={imageSrc}
                            onLoad={onImageLoad}
                            className="max-w-full max-h-64 object-contain"
                          />
                        </ReactCrop>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={cancelCrop}
                          className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={applyCustomCrop}
                          disabled={!completedCrop}
                          className="flex-1 py-2 px-3 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {isUploading ? (
                            <span>Uploading...</span>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Apply & Upload</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : customImages[currentAreaIndex] ? (
                    <div className="flex-1 flex flex-col">
                      <div className="bg-green-50 p-3 rounded mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-800">Image uploaded successfully</span>
                      </div>
                      
                      <div className="flex-1 flex items-center justify-center bg-gray-100 mb-3 p-4">
                        <div className="relative">
                          <img 
                            src={customImages[currentAreaIndex].imageUrl} 
                            alt="Uploaded image" 
                            className="max-w-full max-h-48 object-contain rounded"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeImage(currentAreaIndex)}
                        className="py-2 px-3 border border-red-300 text-red-700 bg-red-50 rounded font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash className="w-4 h-4" />
                        <span>Remove & Upload New</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                      <div className="mb-4 p-3 bg-gray-100 rounded-full">
                        <Image className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="text-center mb-6">
                        <h4 className="font-medium text-gray-800 mb-1">Upload Your Image</h4>
                        <p className="text-sm text-gray-600 max-w-sm">
                          Choose an image to customize this area. Supported formats: 
                          {selectedTemplate.customizableAreas[currentAreaIndex]?.allowedFormats?.map(f => f.split('/')[1].toUpperCase()).join(', ') || 'JPG, PNG'}
                        </p>
                      </div>
                      <label className="cursor-pointer">
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={handleImageUpload}
                          accept={selectedTemplate.customizableAreas[currentAreaIndex]?.allowedFormats?.join(',') || 'image/jpeg,image/png'}
                        />
                        <div className="py-2 px-4 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-colors">
                          <Plus className="w-5 h-5" />
                          <span>Choose Image</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </>
            ) : selectedTemplate ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6">
                <div className="mb-4 p-3 bg-gray-100 rounded-full">
                  <Info className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Customizable Areas</h3>
                <p className="text-center text-sm">
                  This template doesn't have any customizable areas. 
                  You can add it to cart as is or select a different template.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a template to begin customization
              </div>
            )}
            
            {/* Add to Cart Button */}
            <div className="mt-4 border-t pt-4">
              <button
                onClick={addToCartWithCustomization}
                disabled={loading || !selectedTemplate || (selectedTemplate?.customizableAreas?.length > 0 && !customImages.some(img => img !== null))}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPreview;