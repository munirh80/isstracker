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
  iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg filter='url(%23glow)'%3E%3Cpath d='M12 3L4 7v10l8 4 8-4V7l-8-4zM6 9h12M9 7v10M15 7v10' stroke='%23ffffff' stroke-width='1.5' fill='%234d90fe' fill-opacity='0.9'/%3E%3Crect x='8' y='6' width='8' height='12' fill='%234d90fe' stroke='%23ffffff'/%3E%3Cpath d='M3 12h18M10 5h4M10 19h4' stroke='%23ffffff' stroke-width='1.5'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='glow' x='-8' y='-8' width='40' height='40'%3E%3CfeGaussianBlur stdDeviation='2' result='blur'/%3E%3CfeFlood flood-color='%234d90fe' flood-opacity='0.6'/%3E%3CfeComposite in2='blur' operator='in'/%3E%3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
  className: 'iss-icon'
})

 const userIcon = new Icon({
   iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='8' fill='%23FF4646' stroke='%23ffffff' stroke-width='2'/%3E%3Ccircle cx='12' cy='12' r='3' fill='%23ffffff'/%3E%3C/svg%3E`,
   iconSize: [24, 24],
   iconAnchor: [12, 12],
   popupAnchor: [0, -12],
   className: 'user-location-icon'
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
   return (
     <div className="loading-screen">
       <div className="loading-content">
         <div className="loading-spinner"></div>
         <p>Loading ISS location...</p>
       </div>
     </div>
   )
 }

 return (
   <div className="app-container">
     <ThemeToggle />
     <MapContainer
       center={[issPosition.lat, issPosition.lng]}
       zoom={3}
       className="map-container"
       minZoom={2}
       worldCopyJump={true}
       style={{ height: '100%', width: '100%' }}
     >
       <TileLayer
         url={theme === 'dark' 
           ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
           : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
         }
         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
       />
       <Marker position={[issPosition.lat, issPosition.lng]} icon={issIcon}>
         <Popup className="iss-popup">
           <strong>ISS Current Location</strong><br />
           Latitude: <span className="coordinate-value">{issPosition.lat.toFixed(4)}°</span><br />
           Longitude: <span className="coordinate-value">{issPosition.lng.toFixed(4)}°</span><br />
           <span className="popup-update-time">Updated: {lastUpdate.toLocaleTimeString()}</span>
         </Popup>
       </Marker>
       {userLocation.lat && (
         <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
           <Popup>
             <strong>Your Location</strong><br />
             Latitude: {userLocation.lat.toFixed(4)}°<br />
             Longitude: {userLocation.lng.toFixed(4)}°
           </Popup>
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