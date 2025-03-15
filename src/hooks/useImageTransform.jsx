import { useState, useCallback } from 'react';

/**
 * Custom hook for handling image transformations
 */
const useImageTransform = (initialState = {}) => {
  const [transform, setTransform] = useState({
    scale: 1,
    rotation: 0,
    positionX: 0,
    positionY: 0,
    ...initialState
  });
  
  // Reset transformations
  const resetTransform = useCallback(() => {
    setTransform({
      scale: 1,
      rotation: 0,
      positionX: 0,
      positionY: 0
    });
  }, []);
  
  // Scale image up or down
  const adjustScale = useCallback((delta) => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale + delta))
    }));
  }, []);

  // Rotate image
  const adjustRotation = useCallback((degrees = 90) => {
    setTransform(prev => ({
      ...prev,
      rotation: (prev.rotation + degrees) % 360
    }));
  }, []);
  
  // Move image position
  const adjustPosition = useCallback((deltaX, deltaY) => {
    setTransform(prev => ({
      ...prev,
      positionX: prev.positionX + deltaX,
      positionY: prev.positionY + deltaY
    }));
  }, []);
  
  // Get CSS transform string
  const getTransformStyle = useCallback(() => {
    return `translate(${transform.positionX}px, ${transform.positionY}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`;
  }, [transform]);
  
  return {
    transform,
    setTransform,
    resetTransform,
    adjustScale,
    adjustRotation,
    adjustPosition,
    getTransformStyle
  };
};

export default useImageTransform;