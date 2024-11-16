import React, { useState, useEffect } from 'react'
import { calculateViewingDirection, calculateElevation } from '../utils/calculations'

export default function PassPredictions({ userLocation }) {
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userLocation.lat && userLocation.lng) {
      fetchNextPasses()
    }
  }, [userLocation])

  const fetchNextPasses = async () => {
    setLoading(true)
    try {
      // Simulating pass predictions since we can't use external APIs
      const now = new Date()
      const simulatedPasses = Array(3).fill(null).map((_, i) => {
        const passTime = new Date(now.getTime() + (i + 1) * 90 * 60000)
        return {
          startTime: passTime,
          duration: Math.floor(Math.random() * 5) + 3,
          direction: calculateViewingDirection(
            userLocation.lat,
            userLocation.lng,
            userLocation.lat + Math.random() * 10,
            userLocation.lng + Math.random() * 10
          ),
          elevation: Math.floor(Math.random() * 45) + 30
        }
      })
      setPasses(simulatedPasses)
    } catch (error) {
      console.error('Error fetching passes:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return <div>Loading pass predictions...</div>
  }

  return (
    <div className="passes-container">
      <h3>Next Visible Passes</h3>
      {passes.length > 0 ? (
        <div className="pass-list">
          {passes.map((pass, index) => (
            <div key={index} className="pass-card">
              <div className="pass-time">
                {pass.startTime.toLocaleString()}
              </div>
              <div className="pass-details">
                <span>Duration: {pass.duration} minutes</span>
                <span>Direction: {pass.direction}</span>
                <span>Max Elevation: {pass.elevation}°</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No upcoming visible passes</p>
      )}
    </div>
  )
}