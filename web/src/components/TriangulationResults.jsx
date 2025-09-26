import React, { useMemo } from 'react'

function TriangulationResults({ result, onSelectBssid }) {

  // Traitement des données
  const processedData = useMemo(() => {
    if (!result?.networks) return { networks: [], stats: null }

    const { mainNetwork, networks, statistics } = result
    
    // Calculer distances par rapport au réseau principal
    const networksWithDistance = networks.map(network => {
      if (mainNetwork) {
        const R = 6371 // Rayon Terre en km
        const dLat = (network.lat - mainNetwork.lat) * Math.PI / 180
        const dLon = (network.lon - mainNetwork.lon) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                  Math.cos(mainNetwork.lat * Math.PI / 180) * Math.cos(network.lat * Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c * 1000 // en mètres
        
        return { ...network, distanceFromMain: Math.round(distance) }
      }
      return { ...network, distanceFromMain: 0 }
    })

    // Tri par distance par défaut
    const sorted = [...networksWithDistance].sort((a, b) => a.distanceFromMain - b.distanceFromMain)

    return {
      networks: sorted.slice(0, 100), // Afficher les 100 premiers réseaux
      allNetworks: networksWithDistance,
      stats: statistics
    }
  }, [result])

  if (!result) return null

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques principales */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">🎯 iPhone Triangulation Successful</h3>
          <div className="text-sm text-gray-600">
            {result.networksFound} networks discovered
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{result.networksFound}</div>
            <div className="text-xs text-gray-600">Valid networks</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{result.totalNetworksReturned}</div>
            <div className="text-xs text-gray-600">Total Apple</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {result.statistics?.coverageRadius || 0}m
            </div>
            <div className="text-xs text-gray-600">Coverage radius</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {result.statistics?.triangulationQuality || 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Quality</div>
          </div>
        </div>

        <div className="mt-3 text-sm">
          <p><strong>📱 Your network:</strong> {result.requestedBSSID}</p>
          {result.mainNetwork && (
            <p><strong>📍 Position:</strong> {result.mainNetwork.lat.toFixed(6)}, {result.mainNetwork.lon.toFixed(6)}</p>
          )}
        </div>
      </div>


      {/* Liste des réseaux */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 bg-gray-50 border-b rounded-t-lg">
          <h4 className="font-medium text-gray-900">
            📋 Discovered Networks ({processedData.networks.length} displayed / {result.networksFound} total)
          </h4>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {processedData.networks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📡</div>
              <p>No networks to display</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {processedData.networks.map((network, index) => {
                const isMainNetwork = result.mainNetwork && network.paddedBSSID === result.mainNetwork.paddedBSSID
                
                return (
                  <div 
                    key={network.paddedBSSID} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isMainNetwork ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                    }`}
                    onClick={() => onSelectBssid(network.paddedBSSID)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-mono text-sm font-medium text-gray-900">
                            {network.paddedBSSID}
                          </div>
                          {isMainNetwork && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              Your router
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          📍 {network.lat.toFixed(6)}, {network.lon.toFixed(6)}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>📏 {network.distanceFromMain}m</span>
                          <span>🎯 ±{network.hacc || '?'}m</span>
                          <span>📡 Ch.{network.channel || '?'}</span>
                          <span>🕒 {new Date(network.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectBssid(network.paddedBSSID)
                          }}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          📍 Analyze
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

      {/* Message d'explication */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <p><strong>🎯 iPhone Triangulation:</strong> These {result.networksFound} WiFi networks are 
        exactly those that Apple uses to geolocate your iPhone when you're connected 
        to the {result.requestedBSSID} network. This is the same technology your iPhone uses 
        continuously for its precise geolocation!</p>
      </div>
    </div>
  )
}

export default TriangulationResults
