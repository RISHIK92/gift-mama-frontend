import React, { useState, useRef } from 'react';
import { X, Upload, Info, Plus, Trash, Move } from 'lucide-react';

const CustomizedPreviewModal = ({ productId, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const modalContentRef = useRef(null);

  // T-shirt template with 3 mask areas
  const tshirtTemplate = {
    // Main SVG for the t-shirt outline
    tshirtPath: `
      M150,50 C150,50 125,55 100,65 C75,75 65,85 50,110 C35,135 30,160 30,190 
      C30,220 30,350 30,380 C30,410 40,420 60,430 C80,440 120,450 150,450 
      C180,450 220,440 240,430 C260,420 270,410 270,380 C270,350 270,220 270,190 
      C270,160 265,135 250,110 C235,85 225,75 200,65 C175,55 150,50 150,50 
      L170,10 L210,10 L210,40 L240,40 L240,10 L270,10 L270,40 L280,40 
      L260,140 L240,90 L240,110 L210,110 L210,80 L170,80 L170,110 L140,110 
      L140,90 L120,140 L100,40 L110,40 L110,10 L140,10 L140,40 L180,40 L180,10 L150,50
    `,
    // Define masks for customization
    masks: [
      { 
        id: "circle-mask", 
        label: "Chest Circle", 
        type: "circle",
        cx: 150, 
        cy: 150, 
        r: 45,
        requirements: "Circular image, minimum 300x300px"
      },
      { 
        id: "square-mask", 
        label: "Back Square", 
        type: "rect",
        x: 100, 
        y: 250, 
        width: 100, 
        height: 100,
        requirements: "Square image, minimum 400x400px"
      },
      { 
        id: "heart-mask", 
        label: "Heart Accent", 
        type: "path",
        // SVG path for a heart shape
        d: "M150,235 C167,210 200,210 200,230 C200,250 175,270 150,285 C125,270 100,250 100,230 C100,210 133,210 150,235 Z",
        requirements: "Any shape image, minimum 500x500px for best quality"
      }
    ]
  };

  const handleImageUpload = (event, maskId) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate image
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, or GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Create an image element to check dimensions
      const img = new Image();
      img.onload = () => {
        const mask = tshirtTemplate.masks.find(m => m.id === maskId);
        let minDimension = 200; // Default minimum
        
        if (mask.type === 'circle') minDimension = 300;
        else if (mask.type === 'rect') minDimension = 400;
        else if (mask.type === 'path') minDimension = 500;
        
        if (img.width < minDimension || img.height < minDimension) {
          alert(`Image dimensions too small. Minimum required: ${minDimension}x${minDimension}px`);
          return;
        }

        setImages((prev) => [
          ...prev.filter((img) => img.maskId !== maskId),
          { src: e.target.result, maskId, file }
        ]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (maskId) => {
    setImages((prev) => prev.filter((img) => img.maskId !== maskId));
  };

  const handleBackdropClick = (e) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      onClose();
    }
  };

  const addToCartWithCustomization = () => {
    // Implementation would upload the images to server and add to cart
    alert("Custom t-shirt would be added to cart!");
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" 
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalContentRef}
        className="relative bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex justify-between items-center p-4 border-b bg-white z-10">
          <h2 className="text-xl font-bold">Customize Your T-Shirt</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Preview Area */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="border rounded-lg bg-gray-50 p-4 flex items-center justify-center">
                <svg 
                  viewBox="0 0 300 480" 
                  className="w-full max-w-md h-auto"
                >
                  {/* Define Masks */}
                  <defs>
                    {tshirtTemplate.masks.map((mask) => (
                      <mask id={mask.id} key={mask.id}>
                        {mask.type === 'circle' && (
                          <circle
                            cx={mask.cx}
                            cy={mask.cy}
                            r={mask.r}
                            fill="white"
                          />
                        )}
                        {mask.type === 'rect' && (
                          <rect
                            x={mask.x}
                            y={mask.y}
                            width={mask.width}
                            height={mask.height}
                            fill="white"
                          />
                        )}
                        {mask.type === 'path' && (
                          <path
                            d={mask.d}
                            fill="white"
                          />
                        )}
                      </mask>
                    ))}
                  </defs>

                  {/* T-shirt Base */}
                  <path 
                    d={tshirtTemplate.tshirtPath} 
                    fill="#ffffff" 
                    stroke="#e0e0e0" 
                    strokeWidth="2"
                  />

                  {/* Mask Outlines (for visual reference when empty) */}
                  {tshirtTemplate.masks.map((mask) => {
                    const hasImage = images.some(img => img.maskId === mask.id);
                    if (!hasImage) {
                      if (mask.type === 'circle') {
                        return (
                          <circle
                            key={`outline-${mask.id}`}
                            cx={mask.cx}
                            cy={mask.cy}
                            r={mask.r}
                            fill="none"
                            stroke="#ccc"
                            strokeDasharray="5,5"
                            strokeWidth="2"
                          />
                        );
                      } else if (mask.type === 'rect') {
                        return (
                          <rect
                            key={`outline-${mask.id}`}
                            x={mask.x}
                            y={mask.y}
                            width={mask.width}
                            height={mask.height}
                            fill="none"
                            stroke="#ccc"
                            strokeDasharray="5,5"
                            strokeWidth="2"
                          />
                        );
                      } else if (mask.type === 'path') {
                        return (
                          <path
                            key={`outline-${mask.id}`}
                            d={mask.d}
                            fill="none"
                            stroke="#ccc"
                            strokeDasharray="5,5"
                            strokeWidth="2"
                          />
                        );
                      }
                    }
                    return null;
                  })}

                  {/* Render User Images with Masks */}
                  {images.map((image) => {
                    const mask = tshirtTemplate.masks.find((m) => m.id === image.maskId);
                    
                    if (mask.type === 'circle') {
                      return (
                        <image
                          key={image.maskId}
                          href={image.src}
                          x={mask.cx - mask.r}
                          y={mask.cy - mask.r}
                          width={mask.r * 2}
                          height={mask.r * 2}
                          mask={`url(#${image.maskId})`}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      );
                    } else if (mask.type === 'rect') {
                      return (
                        <image
                          key={image.maskId}
                          href={image.src}
                          x={mask.x}
                          y={mask.y}
                          width={mask.width}
                          height={mask.height}
                          mask={`url(#${image.maskId})`}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      );
                    } else if (mask.type === 'path') {
                      // For the heart, we need to calculate a bounding box
                      // These values are approximated for the heart path
                      return (
                        <image
                          key={image.maskId}
                          href={image.src}
                          x="90"
                          y="210"
                          width="120"
                          height="80"
                          mask={`url(#${image.maskId})`}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Labels for empty masks */}
                  {tshirtTemplate.masks.map((mask) => {
                    const hasImage = images.some(img => img.maskId === mask.id);
                    if (!hasImage) {
                      let x, y;
                      
                      if (mask.type === 'circle') {
                        x = mask.cx;
                        y = mask.cy;
                      } else if (mask.type === 'rect') {
                        x = mask.x + mask.width/2;
                        y = mask.y + mask.height/2;
                      } else if (mask.type === 'path') {
                        // Approximate center of heart
                        x = 150;
                        y = 250;
                      }
                      
                      return (
                        <g key={`label-${mask.id}`}>
                          <text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            fill="#888"
                            fontSize="10"
                            fontWeight="bold"
                          >
                            {mask.label}
                          </text>
                        </g>
                      );
                    }
                    return null;
                  })}
                </svg>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700 flex items-start">
                  <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  This is a preview only. Colors and positioning may vary slightly in the final product.
                </p>
              </div>
            </div>

            {/* Upload Options */}
            <div className="lg:w-96">
              <h3 className="text-lg font-semibold mb-4">Upload Your Images</h3>
              
              <div className="space-y-6">
                {tshirtTemplate.masks.map((mask) => {
                  const uploadedImage = images.find(img => img.maskId === mask.id);
                  
                  return (
                    <div key={mask.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{mask.label}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        <p><strong>Requirements:</strong> {mask.requirements}</p>
                      </div>

                      {uploadedImage ? (
                        <div className="relative">
                          <img 
                            src={uploadedImage.src} 
                            alt={`Uploaded for ${mask.label}`}
                            className="w-full h-40 object-cover rounded border"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button 
                              onClick={() => handleRemoveImage(mask.id)}
                              className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            {uploadedImage.file.name}
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-medium">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG (Max 5MB)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, mask.id)}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 bg-yellow-50 p-3 rounded-md">
                <h4 className="font-medium text-yellow-800 mb-1">Image Requirements</h4>
                <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
                  <li>All images should be high-resolution for best quality</li>
                  <li>JPG or PNG format only</li>
                  <li>Maximum file size: 5MB per image</li>
                  <li>Background should be transparent for best results</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={addToCartWithCustomization}
              className="px-4 py-2 bg-[#FF3B3B] text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
              disabled={images.length === 0}
            >
              <Plus className="w-4 h-4" />
              Add Customized T-shirt to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizedPreviewModal;