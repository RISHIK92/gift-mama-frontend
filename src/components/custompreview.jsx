import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image, Group, Rect, Path } from 'react-konva';
import { ZoomIn, ZoomOut, RotateCw, Move, Info, X, Upload, Plus, Trash, RotateCcw, Maximize } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../Url';

const ImageClippingTool = ({ 
  maskId, 
  initialImage, 
  onSave, 
  onCancel, 
  maskDefinition,
  productId
}) => {
  const [imageState, setImageState] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    isDragging: false
  });
  
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(true);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Load image and calculate initial dimensions
  useEffect(() => {
    if (!initialImage?.src) return;

    const img = new window.Image();
    img.onload = () => {
      setImageSize({
        width: img.width,
        height: img.height
      });
      
      // Calculate initial scale to fit the mask
      const scaleX = maskDefinition.width / img.width;
      const scaleY = maskDefinition.height / img.height;
      const initialScale = Math.min(scaleX, scaleY);
      
      setImageState(prev => ({
        ...prev,
        x: maskDefinition.positionX + (maskDefinition.width / 2),
        y: maskDefinition.positionY + (maskDefinition.height / 2),
        scale: initialScale,
        rotation: 0
      }));
    };
    img.src = initialImage.src;
  }, [initialImage, maskDefinition]);

  const handleDragStart = () => {
    setImageState(prev => ({ ...prev, isDragging: true }));
    setTooltipVisible(false);
  };

  const handleDragEnd = (e) => {
    setImageState(prev => ({
      ...prev,
      isDragging: false,
      x: e.target.x(),
      y: e.target.y()
    }));
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    setTooltipVisible(false);
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = imageState.scale;
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - imageState.x) / oldScale,
      y: (pointer.y - imageState.y) / oldScale
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setImageState(prev => ({
      ...prev,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
      scale: Math.max(0.1, Math.min(5, newScale))
    }));
  };

  const handleZoomIn = () => {
    setImageState(prev => ({
      ...prev,
      scale: Math.min(5, prev.scale * 1.1)
    }));
  };

  const handleZoomOut = () => {
    setImageState(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale * 0.9)
    }));
  };

  const handleRotateClockwise = () => {
    setImageState(prev => ({
      ...prev,
      rotation: (prev.rotation + 15) % 360
    }));
  };

  const handleRotateCounterClockwise = () => {
    setImageState(prev => ({
      ...prev,
      rotation: (prev.rotation - 15) % 360
    }));
  };

  const handleSaveEdit = async () => {
    if (!stageRef.current || !maskDefinition) return;
    setLoading(true);
    
    try {
      // Create a temporary stage for export
      const exportStage = new window.Konva.Stage({
        width: maskDefinition.editorWidth,
        height: maskDefinition.editorHeight,
      });
      
      const exportLayer = new window.Konva.Layer();
      exportStage.add(exportLayer);
      
      // Create clipping group
      const clipGroup = new window.Konva.Group({
        clipFunc: (ctx) => {
          const path = new Path2D(maskDefinition.svgPath);
          ctx.fill(path);
        }
      });
      
      // Add image to clip group
      const exportImage = new window.Konva.Image({
        image: imageRef.current,
        x: imageState.x,
        y: imageState.y,
        scaleX: imageState.scale,
        scaleY: imageState.scale,
        rotation: imageState.rotation,
        offsetX: imageSize.width / 2,
        offsetY: imageSize.height / 2
      });
      
      clipGroup.add(exportImage);
      exportLayer.add(clipGroup);
      
      // Get data URL
      const dataURL = exportStage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2
      });
      
      // Convert to blob
      const blob = await (await fetch(dataURL)).blob();
      
      // Prepare form data
      const formData = new FormData();
      formData.append('image', blob, `custom-${productId}-${maskId}.png`);
      formData.append('productId', productId);
      formData.append('maskId', maskId);
      formData.append('position', JSON.stringify({ x: imageState.x, y: imageState.y }));
      formData.append('scale', imageState.scale);
      formData.append('rotation', imageState.rotation);
      
      // Send to backend
      const response = await axios.post(`${BACKEND_URL}upload/custom-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      // Return processed image details to parent
      onSave({
        src: response.data.imageUrl,
        maskId: maskId,
        file: initialImage.file,
        position: { x: imageState.x, y: imageState.y },
        scale: imageState.scale,
        rotation: imageState.rotation,
        uploadId: response.data.uploadId,
        maskDetails: response.data.maskDetails
      });
      
    } catch (error) {
      console.error('Error uploading custom image:', error);
      alert('Failed to upload custom image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-bold text-red-600">
          Position Image for {maskDefinition?.name || 'Mask'}
        </h3>
        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
          {maskDefinition?.name || 'Custom Mask'}
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <button 
          onClick={handleZoomIn}
          className="p-2 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors text-red-600 flex items-center gap-1"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
          <span>Zoom In</span>
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors text-red-600 flex items-center gap-1"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
          <span>Zoom Out</span>
        </button>
        <button 
          onClick={handleRotateClockwise}
          className="p-2 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors text-red-600 flex items-center gap-1"
          title="Rotate Clockwise"
        >
          <RotateCw className="w-4 h-4" />
          <span>Rotate Right</span>
        </button>
        <button 
          onClick={handleRotateCounterClockwise}
          className="p-2 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors text-red-600 flex items-center gap-1"
          title="Rotate Counter-Clockwise"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Rotate Left</span>
        </button>
      </div>
      
      <div className="flex items-center justify-center bg-white border-2 border-red-100 rounded-xl p-4 mb-6 shadow-sm">
        <div 
          ref={containerRef}
          className="relative"
          style={{ 
            width: maskDefinition?.editorWidth || 600, 
            height: maskDefinition?.editorHeight || 600,
            overflow: 'hidden',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}
        >
          <Stage
            ref={stageRef}
            width={maskDefinition?.editorWidth || 600}
            height={maskDefinition?.editorHeight || 600}
            onWheel={handleWheel}
          >
            <Layer>
              {/* Background */}
              <Rect
                width={maskDefinition?.editorWidth || 600}
                height={maskDefinition?.editorHeight || 600}
                fill="rgba(0,0,0,0.4)"
              />
              
              {/* Mask area (clear) */}
              <Group
                clipFunc={(ctx) => {
                  const path = new Path2D(maskDefinition.svgPath);
                  ctx.fill(path);
                }}
                globalCompositeOperation="destination-out"
              >
                <Rect
                  width={maskDefinition?.editorWidth || 600}
                  height={maskDefinition?.editorHeight || 600}
                  fill="white"
                />
              </Group>
              
              {/* Image */}
              {initialImage?.src && (
                <Group
                  x={imageState.x}
                  y={imageState.y}
                  scaleX={imageState.scale}
                  scaleY={imageState.scale}
                  rotation={imageState.rotation}
                  offsetX={imageSize.width / 2}
                  offsetY={imageSize.height / 2}
                  draggable
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <Image
                    ref={imageRef}
                    image={imageRef.current}
                    width={imageSize.width}
                    height={imageSize.height}
                  />
                </Group>
              )}
              
              {/* Mask outline */}
              <Path
                data={maskDefinition.svgPath}
                fill="none"
                stroke="#FF3B3B"
                strokeWidth={2}
              />
            </Layer>
          </Stage>
          
          {/* Hidden image for reference */}
          <img 
            ref={img => {
              if (img && initialImage?.src) {
                img.src = initialImage.src;
                imageRef.current = img;
              }
            }}
            alt="hidden"
            style={{ display: 'none' }}
          />
          
          {/* Drag indicator overlay */}
          {tooltipVisible && !imageState.isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-red-600 bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm flex items-center shadow-md">
                <Move className="w-4 h-4 mr-2" />
                <span>Drag to position • Scroll to zoom</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center text-sm text-gray-600 bg-red-50 border border-red-100 px-4 py-2 rounded-lg">
          <Info className="w-4 h-4 mr-2 text-red-500" />
          <span>Drag to position • Mouse wheel to zoom • Use buttons to adjust</span>
        </div>
        
        <div className="text-xs bg-white px-3 py-1 rounded-full border border-red-100 text-red-600">
          Scale: {imageState.scale.toFixed(2)}x • Rotation: {imageState.rotation}°
        </div>
      </div>
      
      <div className="flex gap-3 justify-end">
        <button 
          onClick={onCancel}
          className="px-5 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium"
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          onClick={handleSaveEdit}
          className={`px-5 py-2 bg-red-600 text-white rounded-lg transition-colors flex items-center font-medium shadow-sm ${
            loading ? 'bg-red-400 cursor-not-allowed' : 'hover:bg-red-700'
          }`}
          disabled={loading}
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
            'Apply Changes'
          )}
        </button>
      </div>
    </div>
  );
};

const CustomizedPreviewModal = ({ productId, onClose }) => {
  const [masks, setMasks] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMask, setEditingMask] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [svgContent, setSvgContent] = useState(null);
  const modalContentRef = useRef(null);
  
  const isSvgUrl = productDetails?.svgData && 
                  (productDetails.svgData.startsWith('http://') || 
                   productDetails.svgData.startsWith('https://'));

  // Load SVG content
  useEffect(() => {
    if (isSvgUrl) {
      fetch(productDetails.svgData, {
        method: 'GET',
        mode: 'no-cors',
        headers: {
          'Accept': 'image/svg+xml'
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load SVG');
          }
          return response.text();
        })
        .then(svgText => {
          setSvgContent(svgText);
        })
        .catch(error => {
          console.error('Error loading SVG:', error);
          // Fallback to direct URL
          setSvgContent(productDetails.svgData);
        });
    } else if (productDetails?.svgData) {
      setSvgContent(productDetails.svgData);
    }
  }, [productDetails?.svgData, isSvgUrl]);

  // Fetch product masks and details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}products/${productId}/customized-preview`);
        
        setMasks(response.data.masks);
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

  const handleImageUpload = (event, maskId) => {
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
      const img = new Image();
      img.onload = () => {
        const mask = masks.find(m => m.id === maskId);
        if (!mask) return;
        
        // Calculate initial scale to fit the mask
        const scaleX = mask.width / img.width;
        const scaleY = mask.height / img.height;
        const initialScale = Math.min(scaleX, scaleY);
        
        setEditingMask(maskId);
        setEditingImage({ 
          src: e.target.result, 
          file,
          initialScale,
          width: img.width,
          height: img.height
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = (editedImage) => {
    const mask = masks.find(m => m.id === editedImage.maskId);
    setImages(prev => [
      ...prev.filter(img => img.maskId !== editedImage.maskId),
      {
        ...editedImage,
        width: mask.width,
        height: mask.height,
        positionX: mask.positionX,
        positionY: mask.positionY,
        maskDetails: mask
      }
    ]);
    setEditingMask(null);
    setEditingImage(null);
  };

  const handleRemoveImage = (maskId) => {
    setImages(prev => prev.filter(img => img.maskId !== maskId));
  };

  const addToCartWithCustomization = async () => {
    try {
      setLoading(true);
      
      // Check if all required masks have images
      const requiredMasks = masks.filter(mask => {
        const productMask = mask.productMasks?.find(pm => pm.productId === productId);
        return productMask?.isRequired;
      });
      
      const missingRequiredMasks = requiredMasks.filter(
        mask => !images.some(img => img.maskId === mask.id)
      );
      
      if (missingRequiredMasks.length > 0) {
        const maskNames = missingRequiredMasks.map(m => m.name).join(', ');
        alert(`Please add images for required areas: ${maskNames}`);
        setLoading(false);
        return;
      }
      
      const response = await axios.post(`${BACKEND_URL}cart/add-customized`, {
        productId,
        items: images.map(img => ({
          customizations: {
            maskId: img.maskId,
            uploadId: img.uploadId,
            position: img.position,
            scale: img.scale,
            rotation: img.rotation
          }
        }))
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
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
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading your customization experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalContentRef}
        className="relative bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-xl"
      >
        <div className="sticky top-0 flex justify-between items-center p-5 border-b bg-white z-10">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-red-600 rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Customize {productDetails?.name || 'Product'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {editingMask && editingImage ? (
          <ImageClippingTool 
            maskId={editingMask}
            initialImage={editingImage}
            onSave={handleSaveEdit}
            onCancel={() => setEditingMask(null)}
            maskDefinition={masks.find(m => m.id === editingMask)}
            productId={productId}
          />
        ) : (
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Preview Area */}
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-red-600 rounded-full mr-2"></div>
                  <h3 className="text-xl font-bold text-gray-800">Preview</h3>
                  <span className="ml-3 text-sm text-gray-600">Your customized {productDetails?.name}</span>
                </div>
                <div className="border-2 border-red-100 rounded-xl bg-white p-4 flex items-center justify-center shadow-sm">
                  <div className="relative" style={{ width: 600, height: 600 }}>
                    {/* Base SVG Layer */}
                    {svgContent && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isSvgUrl ? (
                          <img 
                            src={productDetails.svgData} 
                            alt="Product Base"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <svg 
                            width="100%" 
                            height="100%" 
                            viewBox="0 0 600 600" 
                            preserveAspectRatio="xMidYMid meet"
                          >
                            <path 
                              d={svgContent} 
                              fill="currentColor" 
                              stroke="currentColor" 
                              strokeWidth="1"
                            />
                          </svg>
                        )}
                      </div>
                    )}

                    {/* Konva Layer for Images and Masks */}
                    <div className="absolute inset-0">
                      <Stage width={600} height={600}>
                        <Layer>
                          {/* Custom images */}
                          {images.map((img) => {
                            const mask = masks.find((m) => m.id === img.maskId);
                            if (!mask) return null;
                            
                            return (
                              <Group
                                key={img.uploadId || `temp-${img.maskId}`}
                                clipFunc={(ctx) => {
                                  try {
                                    const path = new Path2D(mask.svgPath);
                                    ctx.fill(path);
                                  } catch (e) {
                                    // Fallback to mask dimensions
                                    ctx.rect(
                                      mask.positionX,
                                      mask.positionY,
                                      mask.width,
                                      mask.height
                                    );
                                  }
                                }}
                              >
                                <Image
                                  image={typeof img.src === 'string' ? new window.Image() : img.src}
                                  onLoad={(e) => {
                                    if (typeof img.src === 'string') {
                                      e.target.image.src = img.src;
                                    }
                                  }}
                                  x={mask.positionX + (mask.width / 2)}
                                  y={mask.positionY + (mask.height / 2)}
                                  offsetX={img.width / 2}
                                  offsetY={img.height / 2}
                                  scaleX={img.scale || 1}
                                  scaleY={img.scale || 1}
                                  rotation={img.rotation || 0}
                                />
                              </Group>
                            );
                          })}
                          
                          {/* Show outlines for areas without uploaded images */}
                          {masks.map((mask) => {
                            if (images.some((img) => img.maskId === mask.id)) return null;
                            return (
                              <Path
                                key={`outline-${mask.id}`}
                                data={mask.svgPath}
                                fill="none"
                                stroke="#FF3B3B"
                                strokeWidth={2}
                                dash={[5, 5]}
                              />
                            );
                          })}
                        </Layer>
                      </Stage>
                    </div>
                  </div>
                </div>
                
                {/* Requirements info below preview */}
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm">
                  <div className="flex items-center text-red-700">
                    <Info className="w-4 h-4 mr-2" />
                    <p>
                      <span className="font-medium">Requirements:</span> Upload clear images for each highlighted area. Images will be positioned and scaled to fit the product design.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Upload Area */}
              <div className="lg:w-1/3">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-red-600 rounded-full mr-2"></div>
                  <h3 className="text-xl font-bold text-gray-800">Upload Images</h3>
                </div>
                
                <div className="space-y-4">
                  {masks.map((mask) => {
                    const uploadedImage = images.find(img => img.maskId === mask.id);
                    const isRequired = mask.productMasks?.some(pm => pm.productId === productId && pm.isRequired);
                    
                    return (
                      <div 
                        key={mask.id} 
                        className={`border rounded-lg p-4 ${
                          uploadedImage ? 'border-green-300 bg-green-50' : 
                          isRequired ? 'border-red-200 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center">
                            <h4 className="font-medium">{mask.name}</h4>
                            {isRequired && (
                              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {mask.name === "Square Frame" ? "Square" : "Circle"}
                          </div>
                        </div>
                        
                        {uploadedImage ? (
                          <div className="relative">
                            <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden">
                              <img 
                                src={uploadedImage.src} 
                                alt={`${mask.name} upload`} 
                                className="object-cover w-full h-full" 
                              />
                            </div>
                            <div className="flex mt-3 gap-2">
                              <button
                                onClick={() => {
                                  setEditingMask(mask.id);
                                  setEditingImage(uploadedImage);
                                }}
                                className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                              >
                                <Move className="w-4 h-4" />
                                <span>Adjust</span>
                              </button>
                              <button
                                onClick={() => handleRemoveImage(mask.id)}
                                className="py-2 px-3 bg-white border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="cursor-pointer w-full">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-300 transition-colors">
                                <div className="flex flex-col items-center">
                                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-600 mb-1">
                                    Drop image here or click to upload
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Recommended: {mask.minWidth}x{mask.minHeight}px or larger
                                  </p>
                                </div>
                              </div>
                              <input
                                type="file"
                                accept="image/jpeg, image/png"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, mask.id)}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between items-center border-t pt-6">
              <div className="text-sm text-gray-600">
                {images.length === 0 ? (
                  <p>No images uploaded yet</p>
                ) : (
                  <p>{images.length} image{images.length !== 1 ? 's' : ''} uploaded</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={addToCartWithCustomization}
                  className={`px-5 py-2 bg-red-600 text-white rounded-lg font-medium shadow-sm flex items-center ${
                    loading || images.length === 0 ? 'bg-red-400 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                  disabled={loading || images.length === 0}
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
        )}
      </div>
    </div>
  );
};

export default CustomizedPreviewModal;