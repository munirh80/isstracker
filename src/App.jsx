import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import PassPredictions from './components/PassPredictions'
import ThemeToggle from './components/ThemeToggle'  

function App() {
  const [issPosition, setIssPosition] = useState({ lat: 0, lng: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('location')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null })
  const [theme] = useState(localStorage.getItem('theme') || 'light')

  const issIcon = new Icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 30],
  })

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }

    const fetchISSPosition = async () => {
      try {
        const response = await fetch('http://api.open-notify.org/iss-now.json')
        const data = await response.json()
        setIssPosition({
          lat: parseFloat(data.iss_position.latitude),
          lng: parseFloat(data.iss_position.longitude)
        })
        setLastUpdate(new Date())
        setLoading(false)
      } catch (error) {
        console.error('Error fetching ISS position:', error)
      }
    }

    fetchISSPosition()
    const interval = setInterval(fetchISSPosition, 5000)
    return () => clearInterval(interval)
  }, [])

  const LocationPanel = () => (
    <div className="panel-content">
      <h2>ISS Location</h2>
      <div className="coordinates">
        <p>
          Latitude: <span className="coordinate-value">{issPosition.lat.toFixed(4)}°</span>
        </p>
        <p>
          Longitude: <span className="coordinate-value">{issPosition.lng.toFixed(4)}°</span>
        </p>
      </div>
      <p className="refresh-time">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </p>
    </div>
  )

  const LiveStreamPanel = () => (
    <div className="panel-content">
      <h2>ISS Live Stream</h2>
      <iframe
        className="live-stream"
        src="https://ustream.tv/embed/17074538"
        frameBorder="0"
        allowFullScreen
      />
      <p className="refresh-time">
        Live feed courtesy of NASA
      </p>
    </div>
  )

  const PassesPanel = () => (
    <div className="panel-content">
      <h2>Viewing Opportunities</h2>
      {userLocation.lat ? (
        <PassPredictions userLocation={userLocation} />
      ) : (
        <p>Please enable location services to see pass predictions</p>
      )}
    </div>
  )

  if (loading) {
    return <div className="loading-screen">Loading ISS location...</div>
  }

  return (
    <div className="app-container" style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <ThemeToggle />
      <MapContainer
        center={[issPosition.lat, issPosition.lng]}
        zoom={3}
        className="map-container"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={theme === 'dark' 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
          attribution={theme === 'dark'
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        />
        <Marker position={[issPosition.lat, issPosition.lng]} icon={issIcon}>
          <Popup>
            <strong>ISS Current Location</strong><br />
            Lat: {issPosition.lat.toFixed(4)}°<br />
            Lng: {issPosition.lng.toFixed(4)}°
          </Popup>
        </Marker>
        {userLocation.lat && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>
      <div className="control-panel">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            Location
          </button>
          <button 
            className={`tab ${activeTab === 'passes' ? 'active' : ''}`}
            onClick={() => setActiveTab('passes')}
          >
            Passes
          </button>
          <button 
            className={`tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live View
          </button>
        </div>
        {activeTab === 'location' && <LocationPanel />}
        {activeTab === 'live' && <LiveStreamPanel />}
        {activeTab === 'passes' && <PassesPanel />}
      </div>
    </div>
  )
}

export default App