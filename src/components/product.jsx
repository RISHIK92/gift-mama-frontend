import { CheckCircle, Heart, ShoppingCart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { BACKEND_URL } from "../Url";
import axios from "axios";
import { toast } from "react-hot-toast";

// 3D Particle Animation Component
const ParticleAnimation = ({ isActive, type, onComplete }) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const particles = [];
    const sparkles = [];

    // Create main particles
    for (let i = 0; i < (type === "cart" ? 12 : 8); i++) {
      const particle = document.createElement("div");
      particle.className = `absolute w-2 h-2 rounded-full ${
        type === "cart" ? "bg-green-400" : "bg-red-400"
      } opacity-80`;

      // Random starting position around the button
      const angle = (i / (type === "cart" ? 12 : 8)) * 2 * Math.PI;
      const startX = Math.cos(angle) * 10;
      const startY = Math.sin(angle) * 10;

      particle.style.left = `${50 + startX}%`;
      particle.style.top = `${50 + startY}%`;
      particle.style.transform = "translate(-50%, -50%)";
      particle.style.zIndex = "20";

      container.appendChild(particle);
      particles.push({ element: particle, angle, distance: 10 });
    }

    // Create sparkle particles
    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = `absolute opacity-90`;
      sparkle.innerHTML = "✨";
      sparkle.style.fontSize = `${Math.random() * 8 + 6}px`;
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.transform = "translate(-50%, -50%)";
      sparkle.style.zIndex = "25";
      sparkle.style.pointerEvents = "none";

      container.appendChild(sparkle);
      sparkles.push({
        element: sparkle,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let startTime = Date.now();
    const duration = 1200;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Animate main particles with 3D effect
      particles.forEach((particle, index) => {
        const { element, angle } = particle;
        const distance = 10 + progress * 60;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - progress * 30; // Upward movement
        const z = Math.sin(progress * Math.PI) * 20; // 3D depth effect

        const scale = 1 + Math.sin(progress * Math.PI) * 0.5;
        const opacity = 1 - progress;

        element.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
        element.style.opacity = opacity;
        element.style.filter = `blur(${progress * 2}px)`;
      });

      // Animate sparkles with floating and rotation
      sparkles.forEach((sparkle, index) => {
        const { element, vx, vy, rotation, rotationSpeed } = sparkle;
        const currentX = parseFloat(element.style.left) + vx * 0.5;
        const currentY =
          parseFloat(element.style.top) + vy * 0.5 - progress * 20;
        const currentRotation = rotation + rotationSpeed * progress * 10;

        const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.3;
        const opacity = Math.sin((1 - progress) * Math.PI);

        element.style.left = `${currentX}%`;
        element.style.top = `${currentY}%`;
        element.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${scale})`;
        element.style.opacity = opacity;
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Clean up
        particles.forEach((p) => p.element.remove());
        sparkles.forEach((s) => s.element.remove());
        if (onComplete) onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particles.forEach((p) => p.element?.remove());
      sparkles.forEach((s) => s.element?.remove());
    };
  }, [isActive, type, onComplete]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ perspective: "1000px" }}
    />
  );
};

// Enhanced Button Component with 3D effects
const AnimatedButton = ({
  onClick,
  disabled,
  isLoading,
  showSuccess,
  showParticles,
  type,
  className,
  children,
  onParticleComplete,
}) => {
  return (
    <div className="relative">
      <button
        className={`${className} transition-all duration-200 transform hover:scale-110 active:scale-95 ${
          showSuccess ? "animate-pulse" : ""
        } ${disabled ? "opacity-50" : "shadow-lg hover:shadow-xl"}`}
        onClick={onClick}
        disabled={disabled}
        style={{
          transform: showSuccess ? "scale(1.1)" : undefined,
          boxShadow: showSuccess
            ? `0 0 20px ${type === "cart" ? "#10b981" : "#ef4444"}40`
            : undefined,
        }}
      >
        {children}
      </button>
      <ParticleAnimation
        isActive={showParticles}
        type={type}
        onComplete={onParticleComplete}
      />
    </div>
  );
};

export const ProductCard = ({
  product,
  sortOption = "default",
  state = true,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCartParticles, setShowCartParticles] = useState(false);
  const [keepVisible, setKeepVisible] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showWishlistParticles, setShowWishlistParticles] = useState(false);
  const [wishlistSuccess, setWishlistSuccess] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get(
          `${BACKEND_URL}wishlist/check/${product.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        );

        setIsInWishlist(response.data?.isInWishlist === true);
      } catch (err) {
        console.error("Failed to check wishlist status:", err);
        setIsInWishlist(false);
      }
    };

    checkWishlistStatus();
  }, [product.id]);

  const discountPercentage =
    product.discount ||
    (product.price > product.discountedPrice
      ? Math.round(
          ((product.price - product.discountedPrice) / product.price) * 100
        )
      : 0);

  const addToCart = async (e) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      setKeepVisible(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${BACKEND_URL}cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add item to cart");
      }

      // Trigger particle animation
      setShowCartParticles(true);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      window.dispatchEvent(new Event("cartUpdated"));
      setIsLoading(false);
    }
  };

  const handleCartParticleComplete = () => {
    setShowCartParticles(false);
    setTimeout(() => {
      setShowSuccess(false);
      setKeepVisible(false);
    }, 500);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();

    if (isWishlistLoading) return;

    try {
      setIsWishlistLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      const previousState = isInWishlist;
      setIsInWishlist(!previousState);

      if (previousState) {
        const response = await fetch(`${BACKEND_URL}wishlist/remove`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });

        if (response.ok) {
          toast.success("Removed from wishlist");
          setShowWishlistParticles(true);
          setWishlistSuccess(true);
        } else {
          setIsInWishlist(true);
          toast.error("Failed to remove from wishlist");
        }
      } else {
        const response = await axios.post(
          `${BACKEND_URL}wishlist/add`,
          { productId: product.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status >= 200 && response.status < 300) {
          toast.success("Added to wishlist");
          setShowWishlistParticles(true);
          setWishlistSuccess(true);
        } else {
          setIsInWishlist(false);
          toast.error("Failed to add to wishlist");
        }
      }
    } catch (err) {
      console.error(
        `Failed to ${isInWishlist ? "add to" : "remove from"} wishlist:`,
        err
      );
      setIsInWishlist(!isInWishlist);
      toast.error(
        `Failed to ${isInWishlist ? "add to" : "remove from"} wishlist`
      );
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleWishlistParticleComplete = () => {
    setShowWishlistParticles(false);
    setTimeout(() => {
      setWishlistSuccess(false);
    }, 500);
  };

  const getBadgeColor = () => {
    if (discountPercentage >= 30) return "bg-red-600";
    if (discountPercentage >= 20) return "bg-red-500";
    if (discountPercentage >= 10) return "bg-red-400";
    return "bg-red-300";
  };

  return (
    <div
      className={`bg-white rounded-lg ${
        state ? "w-[230px]" : "w-full"
      } shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-pointer overflow-hidden`}
    >
      <div className="rounded-t-lg relative overflow-hidden pt-[100%]">
        {discountPercentage > 0 && (
          <div
            className={`${getBadgeColor()} absolute text-white text-xs px-2 py-1 left-2 top-2 rounded-lg z-10 animate-pulse`}
          >
            {discountPercentage}% off
          </div>
        )}

        {product.isNew && (
          <div className="bg-green-500 absolute text-white text-xs px-2 py-1 right-2 top-2 rounded-lg z-10 animate-bounce">
            New
          </div>
        )}

        <img
          src={product.image}
          alt={product.title}
          className={`absolute top-0 left-0 ${
            state ? "w-[230px] h-[250px]" : "w-full h-full"
          } object-cover transition-transform duration-500 group-hover:scale-105`}
          onClick={() => navigate(`/product/${product.title}`)}
        />

        <div
          className={`absolute right-2 top-2 flex flex-col gap-2 transition-all duration-300 ${
            keepVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <AnimatedButton
            onClick={addToCart}
            disabled={isLoading || showSuccess}
            isLoading={isLoading}
            showSuccess={showSuccess}
            showParticles={showCartParticles}
            type="cart"
            onParticleComplete={handleCartParticleComplete}
            className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full hover:from-red-400 hover:to-red-500 transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : showSuccess ? (
              <CheckCircle className="w-5 h-5 text-white animate-bounce" />
            ) : (
              <ShoppingCart className="w-5 h-5 text-white" />
            )}
          </AnimatedButton>

          <AnimatedButton
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            isLoading={isWishlistLoading}
            showSuccess={wishlistSuccess}
            showParticles={showWishlistParticles}
            type="wishlist"
            onParticleComplete={handleWishlistParticleComplete}
            className={`p-2 ${
              isInWishlist
                ? "bg-gradient-to-r from-red-500 to-pink-500"
                : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-400 hover:to-pink-400"
            } rounded-full transition-all duration-200`}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlistLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <Heart
                className={`w-5 h-5 transition-all duration-200 ${
                  isInWishlist
                    ? "text-white fill-white scale-110"
                    : "text-white hover:scale-110"
                }`}
              />
            )}
          </AnimatedButton>
        </div>
      </div>

      <div className="px-3 py-2">
        <h2
          className="text-md font-semibold line-clamp-2 h-12 hover:text-red-500 transition-colors duration-200"
          title={product.title}
        >
          {product.title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-bold text-lg">
            ₹{product.discountedPrice}
          </span>
          {product.price > product.discountedPrice && (
            <span className="text-gray-400 line-through text-sm">
              ₹{product.price}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {product.inclusiveOfTaxes
              ? "Inclusive of all taxes"
              : "Exclusive of taxes"}
          </p>

          {product.fastDelivery && (
            <span className="text-xs bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-2 py-1 rounded-full animate-pulse">
              ⚡ Fast Delivery
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const sortProducts = (products, sortOption) => {
  if (!products || !products.length) return [];

  const productsCopy = [...products];

  switch (sortOption) {
    case "priceLow":
      return productsCopy.sort((a, b) => a.discountedPrice - b.discountedPrice);
    case "priceHigh":
      return productsCopy.sort((a, b) => b.discountedPrice - a.discountedPrice);
    case "discount":
      return productsCopy.sort((a, b) => {
        const discountA =
          a.discount ||
          (a.price > a.discountedPrice
            ? ((a.price - a.discountedPrice) / a.price) * 100
            : 0);
        const discountB =
          b.discount ||
          (b.price > b.discountedPrice
            ? ((b.price - b.discountedPrice) / b.price) * 100
            : 0);
        return discountB - discountA;
      });
    default:
      return productsCopy;
  }
};
