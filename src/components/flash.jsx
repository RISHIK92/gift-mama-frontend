import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../Url"
import { Clock, ShoppingCart, Heart, ArrowRight, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react"

export function FlashSale() {
  const [flashSales, setFlashSales] = useState([])
  const [saleProducts, setSaleProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState({})
  const [addedToCart, setAddedToCart] = useState({})
  const [inWishlist, setInWishlist] = useState({})
  const [activeTab, setActiveTab] = useState(0)
  const [tabScrollPosition, setTabScrollPosition] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveFlashSales()
    checkWishlistStatus()
  }, [])

  useEffect(() => {
    if (flashSales.length > 0) {
      const timers = flashSales.map((sale) => {
        const endTime = new Date(sale.endTime).getTime()
        return setInterval(() => {
          const now = new Date().getTime()
          const distance = endTime - now
          if (distance < 0) {
            setTimeLeft((prev) => ({ ...prev, [sale.id]: { expired: true } }))
          } else {
            setTimeLeft((prev) => ({
              ...prev,
              [sale.id]: {
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
              },
            }))
          }
        }, 1000)
      })
      return () => timers.forEach((timer) => clearInterval(timer))
    }
  }, [flashSales])

  const fetchActiveFlashSales = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${BACKEND_URL}flash-sales/active`)
      setFlashSales(response.data)
      if (response.data.length > 0) {
        await Promise.all(response.data.map((sale) => fetchSaleDetails(sale.id)))
      }
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch flash sales:", err)
      setError("Failed to fetch active flash sales.")
      setLoading(false)
    }
  }

  const fetchSaleDetails = async (saleId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}flash-sales/${saleId}`)
      const formattedProducts = response.data.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        originalPrice: Number.parseFloat(item.product.price),
        salePrice: Number.parseFloat(item.salePrice),
        discount: Number.parseFloat(item.discount),
        image: item.product.images && item.product.images.length > 0 ? item.product.images[0].displayImage : null,
      }))
      setSaleProducts((prev) => ({ ...prev, [saleId]: formattedProducts }))
    } catch (err) {
      console.error("Failed to fetch sale details:", err)
      setError("Failed to fetch sale products.")
    }
  }

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await axios.get(`${BACKEND_URL}wishlist/items`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const wishlistMap = {}
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(item => {
          if (item.productId) {
            wishlistMap[item.productId] = true
          }
        })
      }
      setInWishlist(wishlistMap)
    } catch (err) {
      console.error("Failed to fetch wishlist status:", err)
    }
  }

  const handleAddToCart = async (productId, salePrice) => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        window.location.href = "/login?redirect=flash-sale"
        return
      }
      await axios.post(
        `${BACKEND_URL}cart/add`,
        { productId, quantity: 1, flashSalePrice: salePrice },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAddedToCart((prev) => ({ ...prev, [productId]: true }))
      setTimeout(() => {
        setAddedToCart((prev) => ({ ...prev, [productId]: false }))
      }, 3000)
    } catch (err) {
      console.error("Failed to add product to cart:", err)
      setError("Failed to add product to cart.")
    }
  }

  const handleAddToWishlist = async (productId) => {
    if (inWishlist[productId]) return
    
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        window.location.href = "/login?redirect=flash-sale"
        return
      }
      
      setInWishlist(prev => ({ ...prev, [productId]: true }))
      
      await axios.post(
        `${BACKEND_URL}wishlist/add`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (err) {
      setInWishlist(prev => ({ ...prev, [productId]: false }))
      console.error("Failed to add product to wishlist:", err)
      setError("Failed to add product to wishlist.")
    }
  }

  const scrollTabs = (direction) => {
    const tabContainer = document.getElementById('tab-container')
    if (!tabContainer) return
    
    const scrollAmount = direction === 'left' ? -200 : 200
    const newPosition = tabScrollPosition + scrollAmount
    
    tabContainer.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
    
    setTabScrollPosition(newPosition)
  }
  
  const checkScrollable = () => {
    const tabContainer = document.getElementById('tab-container')
    if (!tabContainer) return { canScrollLeft: false, canScrollRight: false }
    
    return {
      canScrollLeft: tabContainer.scrollLeft > 0,
      canScrollRight: tabContainer.scrollLeft < (tabContainer.scrollWidth - tabContainer.clientWidth - 10)
    }
  }

  if (loading && flashSales.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64 p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500 mb-4"></div>
          <p className="text-gray-500">Loading flash sales...</p>
        </div>
      </div>
    )
  }

  if (error && flashSales.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={fetchActiveFlashSales}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (flashSales.length === 0) {
    return (
      <div className="bg-gradient-to-b from-red-50 to-white p-8 text-center">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={24} className="text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Sales</h2>
        <p className="text-gray-600 mb-6">
          We're preparing some amazing deals for you! Check back soon for upcoming flash sales.
        </p>
        <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center mx-auto">
          View Regular Products <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    )
  }
  
  const { canScrollLeft, canScrollRight } = checkScrollable()

  return (
    <div className="bg-gradient-to-b from-red-50 to-white">
      {/* Flash Sale Banner with integrated heading and timer */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-3">⚡ Flash Sales</h1>
          <p className="text-red-100 text-center max-w-2xl mx-auto text-lg mb-6">
            Limited-time offers at unbeatable prices. Grab them before they're gone!
          </p>
          
          {/* Centered Sale Tabs */}
          {flashSales.length > 1 && (
            <div className="relative max-w-4xl mx-auto flex justify-center">
              {/* Left scroll button */}
              <button 
                onClick={() => scrollTabs('left')}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-red-800/70 hover:bg-red-800 rounded-full p-1 shadow-md ${
                  canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } transition-opacity duration-300`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              
              {/* Centered Tab container with fixed width */}
              <div className="relative w-full max-w-2xl">
                <div 
                  id="tab-container"
                  className="flex overflow-x-auto scrollbar-hide bg-red-700/30 backdrop-blur rounded-lg p-2 mb-6 scroll-smooth mx-auto"
                  onScroll={(e) => setTabScrollPosition(e.currentTarget.scrollLeft)}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="flex mx-auto">
                    {flashSales.map((sale, index) => (
                      <button
                        key={sale.id}
                        onClick={() => setActiveTab(index)}
                        className={`relative whitespace-nowrap px-6 py-3 font-medium text-sm transition-all duration-300 rounded-md flex-shrink-0 mx-1 ${
                          activeTab === index 
                            ? "bg-white text-red-600 shadow-md transform scale-105" 
                            : "text-white hover:bg-red-700/50"
                        }`}
                      >
                        {sale.title}
                        {activeTab === index && (
                          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-red-600 rounded-full"></span>
                        )}
                        {timeLeft[sale.id] && !timeLeft[sale.id]?.expired && (
                          <span className="absolute -top-2 -right-2 bg-red-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {timeLeft[sale.id].hours}h
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right scroll button */}
              <button 
                onClick={() => scrollTabs('right')}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-red-800/70 hover:bg-red-800 rounded-full p-1 shadow-md ${
                  canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } transition-opacity duration-300`}
                aria-label="Scroll right"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </div>
          )}
          
          {/* Timer integrated in banner */}
          {flashSales[activeTab] && timeLeft[flashSales[activeTab].id] && !timeLeft[flashSales[activeTab].id]?.expired && (
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-lg animate-pulse-slow">
              <Clock size={20} className="text-white mr-2" />
              <p className="text-white font-medium text-sm mr-2">Ends in:</p>
              <div className="flex items-center gap-1">
                <div className="bg-white text-red-600 font-bold text-lg rounded px-2 py-1 min-w-8 text-center">
                  {timeLeft[flashSales[activeTab].id].hours}
                </div>
                <span className="text-white">:</span>
                <div className="bg-white text-red-600 font-bold text-lg rounded px-2 py-1 min-w-8 text-center">
                  {timeLeft[flashSales[activeTab].id].minutes}
                </div>
                <span className="text-white">:</span>
                <div className="bg-white text-red-600 font-bold text-lg rounded px-2 py-1 min-w-8 text-center">
                  {timeLeft[flashSales[activeTab].id].seconds}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Active Sale Section */}
        {flashSales.map((sale, index) => (
          <div 
            key={sale.id} 
            className={`transition-all duration-500 ${
              activeTab === index ? 'opacity-100 translate-y-0' : 'opacity-0 absolute -translate-y-4 pointer-events-none'
            }`}
          >
            {/* Sale description */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{sale.title}</h2>
              <p className="text-gray-600 mt-1">{sale.description}</p>
            </div>

            {/* Products grid */}
            {!saleProducts[sale.id] ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-red-600"></div>
              </div>
            ) : saleProducts[sale.id].length === 0 ? (
              <div className="text-center py-12 text-gray-600">No products available for this sale.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                {saleProducts[sale.id].map((product) => (
                  <div 
                    key={product.id} 
                    className="group bg-white border border-gray-200 rounded-xl cursor-pointer overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={() => navigate(`/product/${product.name}`)}>
                    <div className="relative">
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                          {product.discount}% OFF
                        </div>
                      </div>
                      <div className="h-48 bg-gray-50 flex items-center justify-center p-6 group-hover:bg-gray-100 transition-colors">
                        {product.image ? (
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-contain transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2 h-12 text-lg">{product.name}</h3>
                      
                      <div className="flex items-baseline gap-3 my-3">
                        <span className="text-red-600 font-bold text-xl">₹{product.salePrice.toFixed(2)}</span>
                        <span className="text-gray-500 line-through text-sm">₹{product.originalPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => handleAddToCart(product.id, product.salePrice)}
                          className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                            addedToCart[product.id] 
                              ? "bg-green-600 text-white" 
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          <ShoppingCart size={16} className="mr-2" />
                          {addedToCart[product.id] ? "Added" : "Add to Cart"}
                        </button>
                        
                        <button
                          onClick={() => handleAddToWishlist(product.id)}
                          className={`p-2 border rounded-lg ${
                            inWishlist[product.id] 
                              ? "bg-red-600 border-red-600 text-white" 
                              : "border-gray-300 hover:bg-gray-100 text-gray-600"
                          }`}
                          disabled={inWishlist[product.id]}
                          aria-label={inWishlist[product.id] ? "Added to wishlist" : "Add to wishlist"}
                          title={inWishlist[product.id] ? "Added to wishlist" : "Add to wishlist"}
                        >
                          <Heart 
                            size={16}
                            className={inWishlist[product.id] ? "fill-white" : ""} 
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FlashSale