import { useState, useEffect } from "react"
import axios from "axios"
import { BACKEND_URL } from "../Url"
import { Link } from "react-router-dom"
import { Clock, Zap, ArrowRight } from "lucide-react"

export function HomeFlashSaleBanner() {
  const [activeSale, setActiveSale] = useState(null)
  const [timeLeft, setTimeLeft] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveSale = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BACKEND_URL}flash-sales/active`)
        if (response.data.length > 0) {
          setActiveSale(response.data[0])
        }
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch flash sale:", err)
        setLoading(false)
      }
    }

    fetchActiveSale()
  }, [])

  useEffect(() => {
    if (activeSale) {
      const endTime = new Date(activeSale.endTime).getTime()

      const timer = setInterval(() => {
        const now = new Date().getTime()
        const distance = endTime - now

        if (distance < 0) {
          clearInterval(timer)
          setTimeLeft({ expired: true })
        } else {
          setTimeLeft({
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          })
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [activeSale])

  if (loading) return null
  if (!activeSale || timeLeft.expired) return null

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">

        {/* Left: Flash Sale Text */}
        <div className="flex items-center">
          <Zap size={16} className="text-yellow-300 mr-1.5" />
          <span className="font-semibold text-sm uppercase tracking-wide">Flash Sale</span>
        </div>

        {/* Center: Countdown Timer */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center">
            <Clock size={14} className="mr-1.5 text-white/80" />
            <div className="flex space-x-1">
              <div className="bg-white/15 backdrop-blur-sm text-white rounded px-2 py-1 text-sm font-medium min-w-[28px] text-center">
                {String(timeLeft.hours || 0).padStart(2, "0")}
              </div>
              <span className="text-white/80">:</span>
              <div className="bg-white/15 backdrop-blur-sm text-white rounded px-2 py-1 text-sm font-medium min-w-[28px] text-center">
                {String(timeLeft.minutes || 0).padStart(2, "0")}
              </div>
              <span className="text-white/80">:</span>
              <div className="bg-white/15 backdrop-blur-sm text-white rounded px-2 py-1 text-sm font-medium min-w-[28px] text-center">
                {String(timeLeft.seconds || 0).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
        <p
          className="bg-white/10 hover:bg-white/20 hidden text-white text-xs font-medium px-3 py-1 rounded sm:flex items-center transition-colors duration-150 backdrop-blur-sm border border-white/10"
        >
          Shop Now
          <ArrowRight size={12} className="ml-1" />
        </p>

      </div>
    </div>
  )
}

export default HomeFlashSaleBanner
