"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { BACKEND_URL } from "../Url"
import { Clock, ShoppingCart, Heart, ArrowRight, AlertCircle } from "lucide-react"

export function FlashSale() {
  const [flashSales, setFlashSales] = useState([])
  const [saleProducts, setSaleProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState({})
  const [addedToCart, setAddedToCart] = useState({})
  const [inWishlist, setInWishlist] = useState({})
  const [activeTab, setActiveTab] = useState(0)

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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center max-w-lg mx-auto">
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

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-8 px-4 mb-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">⚡ Flash Sales</h1>
          <p className="text-red-100 text-center max-w-2xl mx-auto">
            Limited-time offers at unbeatable prices. Grab them before they're gone!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Sale Tabs */}
        {flashSales.length > 1 && (
          <div className="flex overflow-x-auto scrollbar-hide mb-6 bg-white rounded-lg shadow p-1">
            {flashSales.map((sale, index) => (
              <button
                key={sale.id}
                onClick={() => setActiveTab(index)}
                className={`whitespace-nowrap px-6 py-3 font-medium text-sm transition-colors rounded-md flex-shrink-0 ${
                  activeTab === index 
                    ? "bg-red-600 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {sale.title}
              </button>
            ))}
          </div>
        )}

        {/* Active Sale Section */}
        {flashSales.map((sale, index) => (
          <div key={sale.id} className={`mb-10 ${activeTab === index ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="max-w-xl">
                    <h2 className="text-2xl font-bold text-gray-900">{sale.title}</h2>
                    <p className="text-gray-600 mt-1">{sale.description}</p>
                  </div>

                  {timeLeft[sale.id] && !timeLeft[sale.id]?.expired && (
                    <div className="flex items-center bg-red-50 p-4 rounded-lg border border-red-100">
                      <Clock size={20} className="text-red-600 mr-3" />
                      <div>
                        <p className="text-xs text-red-600 font-medium uppercase mb-1">Ends in</p>
                        <div className="flex items-center gap-2 text-gray-900">
                          <div className="bg-red-600 text-white font-bold text-lg rounded px-2 py-1 min-w-8 text-center">{timeLeft[sale.id].hours}</div>
                          <span className="text-red-600">:</span>
                          <div className="bg-red-600 text-white font-bold text-lg rounded px-2 py-1 min-w-8 text-center">{timeLeft[sale.id].minutes}</div>
                          <span className="text-red-600">:</span>
                          <div className="bg-red-600 text-white font-bold text-lg rounded px-2 py-1 min-w-8 text-center">{timeLeft[sale.id].seconds}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!saleProducts[sale.id] ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-red-600"></div>
                </div>
              ) : saleProducts[sale.id].length === 0 ? (
                <div className="text-center py-12 text-gray-600">No products available for this sale.</div>
              ) : (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {saleProducts[sale.id].map((product) => (
                      <div 
                        key={product.id} 
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
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
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FlashSale