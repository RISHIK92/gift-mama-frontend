import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, ZoomIn, ZoomOut, Move, ChevronRight, Plus } from 'lucide-react';

const CustomizedPreviewModal = ({ productId, onClose, maskShapes = ["circle", "square", "heart"] }) => {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'customize', 'apply'
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([null, null, null]);
  const [imageTransforms, setImageTransforms] = useState([
    { scale: 1, translateX: 0, translateY: 0, isDragging: false, dragStartX: 0, dragStartY: 0 },
    { scale: 1, translateX: 0, translateY: 0, isDragging: false, dragStartX: 0, dragStartY: 0 },
    { scale: 1, translateX: 0, translateY: 0, isDragging: false, dragStartX: 0, dragStartY: 0 }
  ]);

  const imageRef = useRef(null);
  const modalContentRef = useRef(null);
  const maskAreaRef = useRef(null);

  // Get mask path based on shape (could be fetched from backend)
  const getMaskPath = (shape) => {
    switch (shape) {
      case "circle":
        return "M200,200 m-80,0 a80,80 0 1,0 160,0 a80,80 0 1,0 -160,0"; // Circle mask
      case "square":
        return "M120,120 H280 V280 H120 Z"; // Square mask
      case "heart":
        return "M200,120 C230,90 280,120 280,160 C280,200 240,220 200,260 C160,220 120,200 120,160 C120,120 170,90 200,120 Z"; // Heart shape
      default:
        return "M120,120 H280 V280 H120 Z"; // Default square mask
    }
  };

  // Hard-coded SVG template with three customizable areas
  const productSVG = `
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
      <!-- Product template -->
      <rect x="0" y="0" width="400" height="500" fill="#f8f8f8" />
      
      <!-- T-shirt outline -->
      <path d="M100,100 C100,70 150,50 200,50 C250,50 300,70 300,100 L350,150 L320,180 L300,150 L300,400 L100,400 L100,150 L80,180 L50,150 Z" 
            fill="#ffffff" stroke="#cccccc" stroke-width="2" />
      
      <!-- Collar -->
      <path d="M175,100 C175,80 225,80 225,100" 
            fill="none" stroke="#cccccc" stroke-width="2" />
      
      <!-- Customizable areas indicators -->
      <circle cx="200" cy="200" r="80" fill="none" stroke="#ffaaaa" stroke-width="2" stroke-dasharray="5,5" />
      <rect x="120" y="300" width="50" height="50" fill="none" stroke="#aaffaa" stroke-width="2" stroke-dasharray="5,5" />
      <path d="M300,300 C310,280 330,280 340,300 C350,320 330,340 320,350 C310,340 290,320 300,300 Z" 
            fill="none" stroke="#aaaaff" stroke-width="2" stroke-dasharray="5,5" />
      
      <!-- Product label/branding -->
      <text x="200" y="480" text-anchor="middle" font-size="12" fill="#999999">Your Brand Name</text>
    </svg>
  `;

  // Define customizable areas
  const customizableAreas = [
    {
      id: 'area1',
      position: { x: 200, y: 200 },
      maskShape: maskShapes[0] || "circle",
      guide: "Main logo area"
    },
    {
      id: 'area2',
      position: { x: 145, y: 325 },
      maskShape: maskShapes[1] || "square",
      guide: "Small badge"
    },
    {
      id: 'area3',
      position: { x: 320, y: 325 },
      maskShape: maskShapes[2] || "heart",
      guide: "Detail accent"
    }
  ];

  // Get current mask path
  const getCurrentMaskPath = (index) => {
    return getMaskPath(customizableAreas[index].maskShape);
  };

  useEffect(() => {
    // Simulate loading time for the SVG
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImages = [...uploadedImages];
        newImages[index] = e.target.result;
        setUploadedImages(newImages);

        // Reset transform for this image
        const newTransforms = [...imageTransforms];
        newTransforms[index] = {
          scale: 1,
          translateX: 0,
          translateY: 0,
          isDragging: false,
          dragStartX: 0,
          dragStartY: 0
        };
        setImageTransforms(newTransforms);

        setActiveImageIndex(index);
        if (currentStep === 'upload') {
          setCurrentStep('customize');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Image transformation controls
  const handleZoomIn = () => {
    setImageTransforms(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = {
        ...updated[activeImageIndex],
        scale: updated[activeImageIndex].scale + 0.1
      };
      return updated;
    });
  };

  const handleZoomOut = () => {
    setImageTransforms(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = {
        ...updated[activeImageIndex],
        scale: Math.max(0.1, updated[activeImageIndex].scale - 0.1)
      };
      return updated;
    });
  };

  // Drag handling
  const handleMouseDown = (e) => {
    if (currentStep !== 'customize' || !uploadedImages[activeImageIndex]) return;

    e.preventDefault();

    // Get initial mouse position
    const startX = e.clientX;
    const startY = e.clientY;

    setImageTransforms(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = {
        ...updated[activeImageIndex],
        isDragging: true,
        dragStartX: startX,
        dragStartY: startY
      };
      return updated;
    });
  };

  const handleMouseMove = (e) => {
    const activeTransform = imageTransforms[activeImageIndex];
    if (!activeTransform.isDragging) return;

    // Calculate the distance moved since last update
    const dx = e.clientX - activeTransform.dragStartX;
    const dy = e.clientY - activeTransform.dragStartY;

    setImageTransforms(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = {
        ...updated[activeImageIndex],
        translateX: updated[activeImageIndex].translateX + dx,
        translateY: updated[activeImageIndex].translateY + dy,
        dragStartX: e.clientX,
        dragStartY: e.clientY
      };
      return updated;
    });
  };

  // Add touch support for mobile devices
  const handleTouchStart = (e) => {
    if (currentStep !== 'customize' || !uploadedImages[activeImageIndex]) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];

      setImageTransforms(prev => {
        const updated = [...prev];
        updated[activeImageIndex] = {
          ...updated[activeImageIndex],
          isDragging: true,
          dragStartX: touch.clientX,
          dragStartY: touch.clientY
        };
        return updated;
      });
    }
  };

  const handleTouchMove = (e) => {
    const activeTransform = imageTransforms[activeImageIndex];
    if (!activeTransform.isDragging) return;

    if (e.touches.length === 1) {
      e.preventDefault(); // Prevent scrolling while dragging

      const touch = e.touches[0];

      // Calculate the distance moved since last update
      const dx = touch.clientX - activeTransform.dragStartX;
      const dy = touch.clientY - activeTransform.dragStartY;

      setImageTransforms(prev => {
        const updated = [...prev];
        updated[activeImageIndex] = {
          ...updated[activeImageIndex],
          translateX: updated[activeImageIndex].translateX + dx,
          translateY: updated[activeImageIndex].translateY + dy,
          dragStartX: touch.clientX,
          dragStartY: touch.clientY
        };
        return updated;
      });
    }
  };

  const handleTouchEnd = () => {
    setImageTransforms(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = {
        ...updated[activeImageIndex],
        isDragging: false
      };
      return updated;
    });
  };

  const handleMouseUp = () => {
    setImageTransforms(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = {
        ...updated[activeImageIndex],
        isDragging: false
      };
      return updated;
    });
  };

  // Prevent backdrop clicks from closing when dragging
  const handleBackdropClick = (e) => {
    if (imageTransforms[activeImageIndex].isDragging) {
      e.stopPropagation();
      return;
    }

    if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    // Only add event listeners if dragging is active
    if (imageTransforms[activeImageIndex]?.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeImageIndex, imageTransforms]);

  const handleApplyCustomization = () => {
    setCurrentStep('apply');
    // Here you would normally process the customized images
    // and apply them to the product
  };

  // Create a CSS transform string that can be used consistently across all image instances
  const getTransformStyle = (index) => {
    const transform = imageTransforms[index];
    return {
      transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
      transformOrigin: 'center',
      willChange: 'transform' // Performance optimization for transforms
    };
  };

  // Generate unique mask IDs to prevent conflicts
  const getAreaMaskId = (areaId, mode) => `shapeMask-${productId}-${areaId}-${mode}`;

  // Check if ready to proceed to final step
  const hasAnyImage = uploadedImages.some(img => img !== null);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 select-none"
      onClick={handleBackdropClick}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
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

        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {currentStep === 'upload' && 'Upload Your Images'}
            {currentStep === 'customize' && `Position Image ${activeImageIndex + 1}`}
            {currentStep === 'apply' && 'Applied Customization'}
          </h2>

          {/* Progress steps */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-[#FF3B3B] text-white' : 'bg-gray-200'}`}>1</div>
              <div className="h-1 flex-1 mx-2 bg-gray-200">
                <div className={`h-full bg-[#FF3B3B] ${currentStep !== 'upload' ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'customize' ? 'bg-[#FF3B3B] text-white' : 'bg-gray-200'}`}>2</div>
              <div className="h-1 flex-1 mx-2 bg-gray-200">
                <div className={`h-full bg-[#FF3B3B] ${currentStep === 'apply' ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'apply' ? 'bg-[#FF3B3B] text-white' : 'bg-gray-200'}`}>3</div>
            </div>
            <div className="flex justify-between text-xs mt-1 text-gray-600">
              <div>Upload</div>
              <div>Position</div>
              <div>Apply</div>
            </div>
          </div>

          {loading ? (
            <div className="h-[500px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-[#FF3B3B] border-gray-200"></div>
            </div>
          ) : (
            <>
              {currentStep === 'upload' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {customizableAreas.map((area, index) => (
                    <div key={area.id} className="flex flex-col">
                      <h3 className="text-md font-medium mb-2">{area.guide}</h3>
                      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 aspect-square">
                        {uploadedImages[index] ? (
                          <div className="relative w-full h-full">
                            <img
                              src={uploadedImages[index]}
                              alt={`Uploaded for ${area.guide}`}
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white mb-2">Click to replace</span>
                              <div className="bg-white p-1 rounded-full">
                                <Upload className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <Upload className="h-12 w-12 text-gray-400 mb-2" />
                            <span className="text-md text-gray-600 font-medium">Upload image</span>
                            <span className="text-xs text-gray-500 mt-1">({area.maskShape} mask)</span>
                          </div>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 'customize' && (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-2/3">
                    {/* Image selection tabs */}
                    <div className="flex border-b mb-4">
                      {customizableAreas.map((area, index) => (
                        <button
                          key={area.id}
                          onClick={() => setActiveImageIndex(index)}
                          className={`py-2 px-4 mr-2 font-medium ${
                            activeImageIndex === index
                              ? 'border-b-2 border-[#FF3B3B] text-[#FF3B3B]'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          {area.guide}
                          {uploadedImages[index] && '✓'}
                        </button>
                      ))}
                    </div>

                    <div
                      ref={maskAreaRef}
                      className={`border rounded-lg p-4 bg-gray-50 relative overflow-hidden ${uploadedImages[activeImageIndex] ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      style={{ height: '500px' }}
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleTouchStart}
                    >
                      {uploadedImages[activeImageIndex] && (
                        <div className="relative w-full h-full overflow-hidden">
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              backgroundImage: `url(${uploadedImages[activeImageIndex]})`,
                              backgroundPosition: 'center',
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                              filter: 'grayscale(50%) opacity(0.6)',
                              ...getTransformStyle(activeImageIndex),
                            }}
                          />

                          {/* SVG mask */}
                          <svg
                            className="absolute inset-0 z-10 pointer-events-none"
                            viewBox="0 0 400 500"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="xMidYMid meet"
                          >
                            <defs>
                              <mask id={getAreaMaskId(customizableAreas[activeImageIndex].id, 'customize')}>
                                <rect width="100%" height="100%" fill="black" />
                                <path
                                  d={getCurrentMaskPath(activeImageIndex)}
                                  transform={`translate(${customizableAreas[activeImageIndex].position.x - 200} ${customizableAreas[activeImageIndex].position.y - 200})`}
                                  fill="white"
                                />
                              </mask>
                            </defs>

                            {/* Mask outline for visual guidance */}
                            <path
                              d={getCurrentMaskPath(activeImageIndex)}
                              transform={`translate(${customizableAreas[activeImageIndex].position.x - 200} ${customizableAreas[activeImageIndex].position.y - 200})`}
                              fill="none"
                              stroke="#FF3B3B"
                              strokeWidth="2"
                              strokeDasharray="5,5"
                            />

                            {/* Masked Image */}
                            <foreignObject
                              x="0"
                              y="0"
                              width="400"
                              height="500"
                              mask={`url(#${getAreaMaskId(customizableAreas[activeImageIndex].id, 'customize')})`}
                            >
                              <div
                                xmlns="http://www.w3.org/1999/xhtml"
                                className="w-full h-full"
                                style={{
                                  backgroundImage: `url(${uploadedImages[activeImageIndex]})`,
                                  backgroundPosition: 'center',
                                  backgroundSize: 'contain',
                                  backgroundRepeat: 'no-repeat',
                                  ...getTransformStyle(activeImageIndex),
                                }}
                              />
                            </foreignObject>
                          </svg>
                        </div>
                      )}

                      {/* Show instructional overlay when no image is uploaded */}
                      {!uploadedImages[activeImageIndex] && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="bg-white bg-opacity-80 p-4 rounded-lg text-center max-w-xs">
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-600">Upload an image for this area</p>
                            <label className="inline-block mt-3 px-4 py-2 bg-[#FF3B3B] text-white rounded cursor-pointer hover:bg-red-600">
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, activeImageIndex)}
                              />
                              Choose Image
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image transformation controls */}
                    {uploadedImages[activeImageIndex] && (
                      <div className="flex justify-center mt-4 space-x-3">
                        <button
                          onClick={handleZoomIn}
                          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleZoomOut}
                          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-5 h-5" />
                        </button>
                        <div
                          className="p-2 bg-gray-200 rounded-full flex items-center gap-1"
                          title="Drag to Move"
                        >
                          <Move className="w-5 h-5" />
                          <span className="text-xs">Drag to move</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:w-1/3 bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Customization Preview</h3>
                    <div className="bg-white border rounded mb-4 p-2 aspect-[4/5] flex items-center justify-center">
                      <div className="relative w-full h-full">
                        <div dangerouslySetInnerHTML={{ __html: productSVG }} className="absolute inset-0" />

                        {/* Preview of all masked images on product */}
                        <svg
                          className="absolute inset-0"
                          viewBox="0 0 400 500"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            {customizableAreas.map((area, index) => (
                              <mask key={area.id} id={getAreaMaskId(area.id, 'preview')}>
                                <rect width="100%" height="100%" fill="black" />
                                <path
                                  d={getMaskPath(area.maskShape)}
                                  transform={`translate(${area.position.x - 200} ${area.position.y - 200})`}
                                  fill="white"
                                />
                              </mask>
                            ))}
                          </defs>

                          {/* Render each uploaded image */}
                          {uploadedImages.map((image, index) => {
                            if (!image) return null;
                            const area = customizableAreas[index];

                            return (
                              <foreignObject
                                key={area.id}
                                x="0"
                                y="0"
                                width="400"
                                height="500"
                                mask={`url(#${getAreaMaskId(area.id, 'preview')})`}
                              >
                                <div
                                  xmlns="http://www.w3.org/1999/xhtml"
                                  className="w-full h-full"
                                  style={{
                                    backgroundImage: `url(${image})`,
                                    backgroundPosition: 'center',
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    ...getTransformStyle(index),
                                  }}
                                />
                              </foreignObject>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Position and scale your images until you're happy with how they look.
                      </p>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {customizableAreas.map((area, index) => (
                          <div key={area.id} className={`border p-2 rounded text-xs ${uploadedImages[index] ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}>
                            <div className="text-center mb-1 font-medium truncate">{area.guide}</div>
                            {uploadedImages[index] ? (
                              <div className="text-center text-green-600">✓ Added</div>
                            ) : (
                              <label className="flex justify-center">
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, index)}
                                />
                                <div className="flex items-center text-blue-600 cursor-pointer">
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </div>
                              </label>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleApplyCustomization}
                        disabled={!hasAnyImage}
                        className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 
                          ${hasAnyImage
                            ? 'bg-[#FF3B3B] text-white hover:bg-red-600'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                      >
                        Apply Customization
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'apply' && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                    <div className="flex items-center text-green-700 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Customizations Applied!</span>
                    </div>
                    <p className="text-green-600 text-sm">
                      Your customized design with {uploadedImages.filter(Boolean).length} image{uploadedImages.filter(Boolean).length !== 1 ? 's' : ''} has been successfully applied to the product.
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="aspect-[4/5] relative">
                      {/* Final product with customization applied */}
                      <div dangerouslySetInnerHTML={{ __html: productSVG }} className="absolute inset-0" />

                      <svg
                        className="absolute inset-0"
                        viewBox="0 0 400 500"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          {customizableAreas.map((area, index) => (
                            <mask key={area.id} id={getAreaMaskId(area.id, 'apply')}>
                              <rect width="100%" height="100%" fill="black" />
                              <path
                                d={getMaskPath(area.maskShape)}
                                transform={`translate(${area.position.x - 200} ${area.position.y - 200})`}
                                fill="white"
                              />
                            </mask>
                          ))}
                        </defs>

                        {/* Render each uploaded image */}
                        {uploadedImages.map((image, index) => {
                          if (!image) return null;
                          const area = customizableAreas[index];

                          return (
                            <foreignObject
                              key={area.id}
                              x="0"
                              y="0"
                              width="400"
                              height="500"
                              mask={`url(#${getAreaMaskId(area.id, 'apply')})`}
                            >
                              <div
                                xmlns="http://www.w3.org/1999/xhtml"
                                className="w-full h-full"
                                style={{
                                  backgroundImage: `url(${image})`,
                                  backgroundPosition: 'center',
                                  backgroundSize: 'contain',
                                  backgroundRepeat: 'no-repeat',
                                  ...getTransformStyle(index),
                                }}
                              />
                            </foreignObject>
                          );
                        })}
                      </svg>
                    </div>

                    <div className="p-4 border-t">
                      <h3 className="font-medium mb-2">Custom T-Shirt</h3>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Personalized with your design
                        </div>
                        <div className="font-medium text-lg">$29.99</div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <button
                          className="w-full py-2 px-4 bg-[#FF3B3B] text-white rounded hover:bg-red-600"
                        >
                          Add to Cart
                        </button>

                        <button
                          onClick={() => setCurrentStep('customize')}
                          className="w-full py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                          Edit Customization
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomizedPreviewModal;