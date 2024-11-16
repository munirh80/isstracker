export function calculateViewingDirection(lat1, lon1, lat2, lon2) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  
  // Convert coordinates to radians
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  // Calculate bearing
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = Math.atan2(y, x)
  
  // Convert bearing to degrees and normalize
  const bearing = (θ * 180 / Math.PI + 360) % 360
  
  // Convert bearing to cardinal direction
  const index = Math.round(bearing / 45) % 8
  return directions[index]
}

export function calculateElevation(lat1, lon1, lat2, lon2) {
  // This is a simplified elevation calculation
  // In a real application, you would need to consider the ISS orbit parameters
  // and Earth's curvature for accurate elevation calculations
  const R = 6371 // Earth's radius in kilometers
  const ISS_HEIGHT = 408 // ISS average height in kilometers
  
  // Convert coordinates to radians
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  
  // Calculate great circle distance
  const d = Math.acos(
    Math.sin(φ1) * Math.sin(φ2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  ) * R
  
  // Calculate elevation angle
  const elevation = Math.atan2(ISS_HEIGHT, d) * 180 / Math.PI
  
  return Math.round(elevation)
}