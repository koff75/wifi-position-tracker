import React, { useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import AuroraBackground from '../components/Aurora'
import Sparkles from '../components/Sparkles'
import Spotlight from '../components/Spotlight'
import Beams from '../components/Beams'
import Meteors from '../components/Meteors'
import StatefulButton from '../components/StatefulButton'
import GlowingEffect from '../components/GlowingEffect'
import CometCard from '../components/CometCard'
import Pin3D from '../components/Pin3D'
import BgLines from '../components/BgLines'
import RealBSSIDDiscovery from '../components/RealBSSIDDiscovery'
import TriangulationResults from '../components/TriangulationResults'
import LayoutTextFlip from '../components/LayoutTextFlip'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'

function GoogleMap({ lat, lon }) {
  const src = useMemo(() => {
    if (lat == null || lon == null) return null
    const q = encodeURIComponent(`${lat},${lon}`)
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${q}&zoom=16`
  }, [lat, lon])
  if (!src) return null
  return (
    <div className="w-full h-[480px] rounded-2xl overflow-hidden border border-neutral-200 shadow">
      <iframe
        title="map"
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        src={src}
      />
    </div>
  )
}

// Simplified analysis without security elements
function AdvancedAnalysis({ networks, requestedBSSID }) {
  const analysis = useMemo(() => {
    if (!networks || networks.length === 0) return null

    // Channel statistics
    const channelUsage = networks.reduce((channels, network) => {
      if (network.channel > 0) {
        channels[network.channel] = (channels[network.channel] || 0) + 1
      }
      return channels
    }, {})

    const topChannels = Object.entries(channelUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    // Location accuracy statistics
    const accuracies = networks.map(n => n.hacc).filter(h => h >= 0)
    const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length

    // Coverage density
    const density = networks.length / 2.5 // Approximation of covered area in km²

    return {
      topChannels,
      avgAccuracy: Math.round(avgAccuracy),
      density: Math.round(density),
      totalNetworks: networks.length
    }
  }, [networks])

  if (!analysis) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
        <h4 className="text-lg font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Advanced Network Analysis
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Detailed analysis of {analysis.totalNetworks} discovered WiFi networks
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Popular channels */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-3 flex items-center">
              <span className="mr-2">📻</span>
              Popular Channels
            </h5>
            <div className="space-y-2">
              {analysis.topChannels.map(([channel, count]) => (
                <div key={channel} className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Channel {channel}</span>
                  <span className="font-mono font-medium text-blue-900">{count} networks</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance metrics */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-900 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              Metrics
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Average accuracy</span>
                <span className="font-mono font-medium text-green-900">±{analysis.avgAccuracy}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Density</span>
                <span className="font-mono font-medium text-green-900">{analysis.density}/km²</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Coverage</span>
                <span className="font-mono font-medium text-green-900">~2.5km²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simplified filters without security options
function NetworkFilters({ filters, setFilters, networks }) {
  const channelOptions = useMemo(() => {
    if (!networks) return []
    const channels = [...new Set(networks.map(n => n.channel).filter(c => c > 0))]
    return channels.sort((a, b) => a - b)
  }, [networks])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h4 className="font-medium text-gray-900 mb-3">🔧 Filters and Display</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
          <select
            value={filters.channel}
            onChange={(e) => setFilters({...filters, channel: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All channels</option>
            {channelOptions.map(channel => (
              <option key={channel} value={channel}>Channel {channel}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showOnlyRequested}
              onChange={(e) => setFilters({...filters, showOnlyRequested: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Show only requested BSSID</span>
          </label>
        </div>
      </div>
    </div>
  )
}

// Networks display with map and filtered list
function NetworksMap({ networks, requestedBSSID, filters }) {
  // Filter networks according to criteria
  const filteredNetworks = useMemo(() => {
    if (!networks || networks.length === 0) return []

    let filtered = networks

    if (filters.channel !== 'all') {
      filtered = filtered.filter(net => net.channel === parseInt(filters.channel))
    }

    if (filters.showOnlyRequested) {
      filtered = filtered.filter(net => net.bssid.toLowerCase() === requestedBSSID.toLowerCase())
    }

    return filtered
  }, [networks, filters, requestedBSSID])

  // Create the map with all points using Google Static Maps API (shows actual pins!)
  const src = useMemo(() => {
    if (!filteredNetworks || filteredNetworks.length === 0) return null

    // Find center point
    const mainNetwork = filteredNetworks.find(net => 
      net.bssid.toLowerCase() === requestedBSSID.toLowerCase()
    ) || filteredNetworks[0]

    if (!mainNetwork) return null

    // Calculate center of all filtered networks
    const centerLat = filteredNetworks.reduce((sum, net) => sum + net.lat, 0) / filteredNetworks.length
    const centerLon = filteredNetworks.reduce((sum, net) => sum + net.lon, 0) / filteredNetworks.length

    // Use Google Static Maps API to show actual pins (limited to 100 markers max)
    const limitedNetworks = filteredNetworks.slice(0, 100)
    
    const markers = limitedNetworks.map(network => {
      const isRequested = network.bssid.toLowerCase() === requestedBSSID.toLowerCase()
      const color = isRequested ? 'red' : 'blue'
      const size = isRequested ? 'mid' : 'small'
      return `markers=color:${color}%7Csize:${size}%7C${network.lat},${network.lon}`
    }).join('&')

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
    const params = [
      `center=${centerLat},${centerLon}`,
      'zoom=15',
      'size=800x600',
      'maptype=roadmap',
      `key=${GOOGLE_MAPS_API_KEY}`,
      markers
    ].join('&')

    return `${baseUrl}?${params}`
  }, [filteredNetworks, requestedBSSID])

  if (!src) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="text-gray-500">No networks match your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 bg-gray-50 border-b">
          <h4 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">🗺️</span>
            Networks Map with Pins - {Math.min(filteredNetworks.length, 100)} of {filteredNetworks.length} shown
          </h4>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>📍 All network pins visible on map</span>
            <span>🔄 Updates dynamically with filters</span>
            {filteredNetworks.length > 100 && (
              <span className="text-orange-600">⚠️ Showing first 100 pins (Google limit)</span>
            )}
          </div>
        </div>
        
        <div className="w-full h-[600px] flex justify-center">
          <img
            src={src}
            alt="Networks map with pins"
            className="w-full h-full object-contain rounded-b-lg"
            onClick={() => {
              // Open interactive Google Maps with all the pins when clicked
              const centerLat = filteredNetworks.reduce((sum, net) => sum + net.lat, 0) / filteredNetworks.length
              const centerLon = filteredNetworks.reduce((sum, net) => sum + net.lon, 0) / filteredNetworks.length
              const url = `https://www.google.com/maps?q=${centerLat},${centerLon}&z=15`
              window.open(url, '_blank')
            }}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="p-2 bg-gray-100 text-center text-xs text-gray-600 rounded-b-lg">
          🔴 Your BSSID • 🔵 Other networks • Click map to open interactive version
        </div>
      </div>

      {/* Filtered Networks List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 bg-gray-50 border-b">
          <h4 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">📋</span>
            Filtered Networks ({filteredNetworks.length} shown)
          </h4>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredNetworks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No networks match your current filters</p>
              <p className="text-sm mt-1">Try adjusting the filters above</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNetworks.map((network, index) => {
                const isRequested = network.bssid.toLowerCase() === requestedBSSID.toLowerCase()
                
                return (
                  <div 
                    key={network.bssid || index} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      isRequested ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-mono text-sm font-medium text-gray-900">
                            {network.bssid || 'Unknown BSSID'}
                          </div>
                          {isRequested && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              Requested BSSID
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 space-y-1">
                          <div>📍 {network.lat?.toFixed(6) || 'N/A'}, {network.lon?.toFixed(6) || 'N/A'}</div>
                          <div className="flex items-center space-x-4">
                            <span>📡 Ch.{network.channel || '?'}</span>
                            <span>🎯 ±{network.hacc || '?'}m</span>
                            {network.timestamp && (
                              <span>🕒 {new Date(network.timestamp).toLocaleTimeString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={() => {
                            // Open Google Maps in new tab with this location
                            const url = `https://www.google.com/maps?q=${network.lat},${network.lon}&z=18`
                            window.open(url, '_blank')
                          }}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          📍 View on Maps
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [bssid, setBssid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [auditMode, setAuditMode] = useState(false)
  const [showNetworksMap, setShowNetworksMap] = useState(false)
  const [filters, setFilters] = useState({
    channel: 'all',
    showOnlyRequested: false
  })

  // State for iPhone triangulation
  const [showTriangulation, setShowTriangulation] = useState(false)
  const [triangulationResult, setTriangulationResult] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setAuditMode(false)

    const re = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    if (!re.test(bssid)) {
      setError('Invalid BSSID format. Use HH:HH:HH:HH:HH:HH')
      return
    }

    setLoading(true)

    try {
      const resp = await fetch('/api/geolocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bssid })
      })

      const data = await resp.json()
      if (!resp.ok || !data.success) {
        throw new Error(data.message || 'API Error')
      }

      setResult(data)
      // Remove automatic audit popup as requested
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle iPhone triangulation
  const handleTriangulationComplete = (triangulationData) => {
    setTriangulationResult(triangulationData)
    console.log('🎯 Triangulation completed:', triangulationData)
  }

  // Select a BSSID from triangulation results
  const handleSelectBssidFromTriangulation = (selectedBssid) => {
    setBssid(selectedBssid)
    setShowTriangulation(false)
    // Scroll to main form
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AuroraBackground>
      <Navbar />
      <Beams />
      <BgLines />
      <Meteors count={10} />
      <Sparkles count={90} />
      <div className="min-h-screen text-neutral-900 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-3xl">
          <div className="relative w-full mb-6 md:mb-8">
            <Spotlight>
            <CometCard>
            <div className="p-4 md:p-6 relative">
              <Pin3D />
               <div className="mb-3 md:mb-4">
                 <LayoutTextFlip 
                   text="WiFi"
                   words={["Geolocation", "Triangulation", "Position Tracker", "Network Mapper"]}
                   duration={3000}
                   className="text-2xl md:text-3xl font-semibold tracking-tight"
                 />
               </div>
               <p className="text-neutral-700 text-sm md:text-base">Enter a BSSID to locate its position on Google Maps.</p>
              <form onSubmit={onSubmit} className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 rounded-xl border border-white/60 bg-white/70 backdrop-blur px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                  placeholder="001122334455 or 00:11:22:33:44:55"
                  value={bssid}
                  onChange={e => setBssid(e.target.value)}
                  inputMode="text"
                  autoComplete="off"
                  spellCheck="false"
                  autoCapitalize="characters"
                />
                <StatefulButton
                  type="submit"
                  loading={loading}
                  success={!!result}
                >
                  {loading ? 'Searching…' : (result ? 'Found' : 'Locate')}
                </StatefulButton>
              </form>
              {error && <p className="mt-3 text-red-600">{error}</p>}
              
              {/* Buttons for different modes */}
              <div className="mt-4 text-center space-y-2">
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => {
                      setShowTriangulation(!showTriangulation)
                    }}
                    className="text-sm bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-purple-200"
                  >
                    {showTriangulation ? '📱 Back to BSSID mode' : '🎯 Real iPhone Triangulation'}
                  </button>
                </div>
                <div className="text-xs text-neutral-600">
                  {showTriangulation ? 'Use your connected network BSSID' : 
                   'Discover ALL networks around your connected iPhone'}
                </div>
              </div>
            </div>
            </CometCard>
            </Spotlight>
          </div>

          {/* iPhone triangulation interface */}
          {showTriangulation && (
            <div className="space-y-6">
              <RealBSSIDDiscovery onDiscoveryComplete={handleTriangulationComplete} />
              
              {triangulationResult && (
                <TriangulationResults 
                  result={triangulationResult}
                  onSelectBssid={handleSelectBssidFromTriangulation}
                />
              )}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <CometCard>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm text-neutral-700">Requested BSSID</div>
                      <div className="font-mono">{result.requestedBSSID}</div>
                      <div className="mt-2 text-sm text-neutral-700">Coordinates</div>
                      <div className="font-mono">{result.location.lat}, {result.location.lon}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowNetworksMap(!showNetworksMap)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        {showNetworksMap ? '📍 Simple View' : '🗺️ Complete View'}
                      </button>
                    </div>
                  </div>
                </div>
              </CometCard>

              {/* Complete view with all networks */}
              {showNetworksMap && result.allNetworks && (
                <>
                  <AdvancedAnalysis
                    networks={result.allNetworks}
                    requestedBSSID={result.requestedBSSID}
                  />
                  <NetworkFilters
                    filters={filters}
                    setFilters={setFilters}
                    networks={result.allNetworks}
                  />
                  <NetworksMap
                    networks={result.allNetworks}
                    requestedBSSID={result.requestedBSSID}
                    filters={filters}
                  />
                </>
              )}

              {/* Simple view (default) */}
              {!showNetworksMap && (
                <GlowingEffect>
                  <div>
                    <GoogleMap lat={result.location.lat} lon={result.location.lon} />
                  </div>
                </GlowingEffect>
              )}
            </div>
          )}
        </div>

        {/* SEO Content - Hidden but indexable */}
        <div className="sr-only">
          <h2>Professional WiFi Network Geolocation Tool</h2>
          <p>WiFi Tracker is the ultimate tool for network professionals, security researchers, and IT specialists who need accurate WiFi network geolocation and BSSID triangulation capabilities.</p>
          
          <h3>Key Features</h3>
          <ul>
            <li>BSSID Geolocation using Apple's WPS API</li>
            <li>Real iPhone Triangulation Technology</li>
            <li>WiFi Network Discovery and Mapping</li>
            <li>Interactive Google Maps Integration</li>
            <li>Professional Network Analysis</li>
            <li>Security Auditing Capabilities</li>
          </ul>

          <h3>How WiFi Geolocation Works</h3>
          <p>WiFi geolocation, also known as WiFi positioning system (WPS), uses the unique BSSID (Basic Service Set Identifier) of WiFi access points to determine location. Our tool leverages Apple's extensive WiFi database to provide accurate positioning data.</p>

          <h3>BSSID Triangulation</h3>
          <p>BSSID triangulation involves using multiple nearby WiFi access points to calculate a precise location. This is the same technology used by smartphones for indoor positioning where GPS signals are weak.</p>

          <h3>Use Cases</h3>
          <ul>
            <li>Network Security Auditing</li>
            <li>WiFi Infrastructure Mapping</li>
            <li>Location-based Services Development</li>
            <li>Research and Educational Purposes</li>
            <li>Network Troubleshooting</li>
          </ul>

          <h3>Technical Specifications</h3>
          <p>Our WiFi tracker supports standard BSSID formats (HH:HH:HH:HH:HH:HH) and provides detailed information including coordinates, accuracy metrics, channel information, and timestamp data.</p>
        </div>
      </div>
    </AuroraBackground>
  )
}
