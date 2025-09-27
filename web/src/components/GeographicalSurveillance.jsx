import React, { useState, useMemo } from 'react'
import CometCard from './CometCard'
import StatefulButton from './StatefulButton'
import GlowingEffect from './GlowingEffect'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'

// Composant pour afficher la carte des mouvements
function MovementMap({ movements, origins }) {
  const mapSrc = useMemo(() => {
    if ((!movements || movements.length === 0) && (!origins || origins.length === 0)) {
      return null
    }

    const allPoints = []
    
    // Ajouter les points de mouvements
    if (movements && movements.length > 0) {
      movements.forEach(movement => {
        // Point d'origine (rouge)
        allPoints.push({
          lat: movement.from.lat,
          lon: movement.from.lon,
          color: 'red',
          size: 'small',
          label: 'O' // Origin
        })
        
        // Point de destination (bleu)
        allPoints.push({
          lat: movement.to.lat,
          lon: movement.to.lon,
          color: 'blue',
          size: 'small',
          label: 'D' // Destination
        })
      })
    }
    
    // Ajouter les points d'origines (verts, plus gros)
    if (origins && origins.length > 0) {
      origins.forEach(origin => {
        allPoints.push({
          lat: origin.lat,
          lon: origin.lon,
          color: 'green',
          size: 'mid',
          label: origin.count.toString()
        })
      })
    }

    if (allPoints.length === 0) return null

    // Calculer le centre de la carte
    const centerLat = allPoints.reduce((sum, point) => sum + point.lat, 0) / allPoints.length
    const centerLon = allPoints.reduce((sum, point) => sum + point.lon, 0) / allPoints.length

    // Limiter à 100 marqueurs (limite Google)
    const limitedPoints = allPoints.slice(0, 100)
    
    // Créer les marqueurs
    const markers = limitedPoints.map(point => 
      `markers=color:${point.color}%7Csize:${point.size}%7Clabel:${point.label}%7C${point.lat},${point.lon}`
    ).join('&')

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
    const params = [
      `center=${centerLat},${centerLon}`,
      'zoom=6', // Vue plus large pour voir les mouvements longue distance
      'size=800x500',
      'maptype=roadmap',
      `key=${GOOGLE_MAPS_API_KEY}`,
      markers
    ].join('&')

    return `${baseUrl}?${params}`
  }, [movements, origins])

  if (!mapSrc) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="text-gray-600">No movements to display</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 bg-gray-50 border-b">
        <h5 className="font-medium text-gray-900 flex items-center mb-2">
          <span className="mr-2">🗺️</span>
          Detected Movements Map
        </h5>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>🔴 Origin points</span>
          <span>🔵 Destination points</span>
          <span>🟢 Origin cities (with counter)</span>
        </div>
      </div>
      
      <div className="w-full h-[500px] flex justify-center">
        <img
          src={mapSrc}
          alt="Detected movements map"
          className="w-full h-full object-contain rounded-b-lg cursor-pointer"
          onClick={() => {
            // Ouvrir Google Maps interactif
            const movements = movements || []
            const origins = origins || []
            const allPoints = [...movements.map(m => m.from), ...movements.map(m => m.to), ...origins]
            if (allPoints.length > 0) {
              const centerLat = allPoints.reduce((sum, point) => sum + point.lat, 0) / allPoints.length
              const centerLon = allPoints.reduce((sum, point) => sum + point.lon, 0) / allPoints.length
              const url = `https://www.google.com/maps?q=${centerLat},${centerLon}&z=6`
              window.open(url, '_blank')
            }
          }}
        />
      </div>
      
      <div className="p-3 bg-gray-50 border-t text-center text-xs text-gray-600">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">{movements?.length || 0}</span> movements
          </div>
          <div>
            <span className="font-medium">{origins?.length || 0}</span> origins
          </div>
          <div>
            📍 Click to open in Google Maps
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant pour la sélection de zone géographique
function GeographicalZoneSelector({ onZoneSelect, selectedZone }) {
  const predefinedZones = [
    {
      id: 'ukraine-east',
      name: 'Eastern Ukraine (Donbas)',
      description: 'Donetsk, Luhansk regions',
      coordinates: [[48.0, 37.5], [49.5, 40.2]],
      color: 'blue'
    },
    {
      id: 'crimea',
      name: 'Crimea',
      description: 'Crimean Peninsula',
      coordinates: [[44.3, 33.5], [46.2, 36.7]],
      color: 'red'
    },
    {
      id: 'custom',
      name: 'Custom Zone',
      description: 'Define zone with coordinates',
      coordinates: null,
      color: 'green'
    }
  ]

  return (
    <CometCard>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🗺️</span>
          Geographical zone selection
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predefinedZones.map(zone => (
            <div
              key={zone.id}
              onClick={() => onZoneSelect(zone)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedZone?.id === zone.id
                  ? `border-${zone.color}-500 bg-${zone.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{zone.name}</div>
              <div className="text-sm text-gray-600 mt-1">{zone.description}</div>
              {zone.coordinates && (
                <div className="text-xs text-gray-500 mt-2">
                  {zone.coordinates[0][0]}, {zone.coordinates[0][1]} → {zone.coordinates[1][0]}, {zone.coordinates[1][1]}
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedZone?.id === 'custom' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Custom Coordinates</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Southwest Point</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitude"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitude"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Northeast Point</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitude"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitude"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CometCard>
  )
}

// Composant pour la configuration d'analyse
function AnalysisConfiguration({ config, onConfigChange }) {
  return (
    <CometCard>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚙️</span>
          Analysis Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🎯 Method</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.ouiBootstrap}
                  onChange={(e) => onConfigChange({...config, ouiBootstrap: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Bootstrap by IEEE OUIs</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.nearbyExpansion}
                  onChange={(e) => onConfigChange({...config, nearbyExpansion: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Expansion by nearby BSSIDs</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.longitudinalTracking}
                  onChange={(e) => onConfigChange({...config, longitudinalTracking: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Longitudinal tracking</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">🎛️ Parameters</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Movement threshold (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.movementThreshold}
                  onChange={(e) => onConfigChange({...config, movementThreshold: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific OUIs (e.g. Starlink)
                </label>
                <input
                  type="text"
                  placeholder="74:24:9F,..."
                  value={config.specificOUIs}
                  onChange={(e) => onConfigChange({...config, specificOUIs: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CometCard>
  )
}

// Composant pour afficher les résultats d'analyse
function SurveillanceResults({ results, zone }) {
  if (!results) return null

  const { movements, origins, ouiAnalysis } = results

  return (
    <div className="space-y-4">
      {/* Statistiques générales */}
      <CometCard>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Surveillance Results - {zone?.name}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{results.totalBSSIDs || 0}</div>
              <div className="text-xs text-gray-600">BSSIDs discovered</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{movements?.length || 0}</div>
              <div className="text-xs text-gray-600">Movements detected</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{origins?.length || 0}</div>
              <div className="text-xs text-gray-600">Origins identified</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{ouiAnalysis?.starlink || 0}</div>
              <div className="text-xs text-gray-600">Starlink terminals</div>
            </div>
          </div>
        </div>
      </CometCard>

      {/* Carte des mouvements et origines */}
      {((movements && movements.length > 0) || (origins && origins.length > 0)) && (
        <CometCard>
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🌍</span>
              Movement & Origin Mapping
            </h4>
            <GlowingEffect>
              <MovementMap movements={movements} origins={origins} />
            </GlowingEffect>
          </div>
        </CometCard>
      )}

      {/* Liste des mouvements */}
      {movements && movements.length > 0 && (
        <CometCard>
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🚶</span>
              Detected Movements ({movements.length})
            </h4>
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {movements.slice(0, 10).map((movement, index) => (
                  <div key={index} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-mono text-sm font-medium text-gray-900">
                          {movement.bssid}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          📍 {movement.from.lat.toFixed(6)}, {movement.from.lon.toFixed(6)} → {movement.to.lat.toFixed(6)}, {movement.to.lon.toFixed(6)}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>📏 {movement.distance.toFixed(2)} km</span>
                          <span>🕒 {new Date(movement.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CometCard>
      )}
    </div>
  )
}

export default function GeographicalSurveillance() {
  const [selectedZone, setSelectedZone] = useState(null)
  const [config, setConfig] = useState({
    ouiBootstrap: true,
    nearbyExpansion: true,
    longitudinalTracking: true,
    movementThreshold: 1.0,
    specificOUIs: '74:24:9F'
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleStartAnalysis = async () => {
    if (!selectedZone) {
      setError('Please select a geographical zone')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('🔍 Starting geographical surveillance analysis...')
      
      const response = await fetch('/api/geographical-surveillance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          zone: selectedZone,
          config: config
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur API')
      }

      console.log('✅ Analysis completed:', data.results)
      setResults(data.results)
      
      // Afficher le disclaimer si présent
      if (data.disclaimer) {
        console.log(data.disclaimer)
      }
      
    } catch (err) {
      console.error('❌ Analysis error:', err)
      setError('Analysis error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête explicatif */}
      <CometCard>
        <div className="p-4">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🎓</span>
              Demo only: Geographical surveillance
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                ⚠️ Simulated data
              </p>
              <p className="text-xs text-yellow-700">
                This demonstration illustrates the capabilities of techniques
                with simulated data. The purpose is purely educational and awareness-raising.
              </p>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              The techniques shown here allow detecting and tracking WiFi device movements 
              in specific geographical zones using Apple's geolocation API.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">🎯 Techniques used:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Bootstrap by IEEE OUIs</li>
                  <li>• Expansion by nearby BSSIDs</li>
                  <li>• Longitudinal temporal tracking</li>
                  <li>• Movement detection &gt; threshold</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CometCard>

      {/* Sélection de zone */}
      <GeographicalZoneSelector 
        onZoneSelect={setSelectedZone}
        selectedZone={selectedZone}
      />

      {/* Configuration */}
      <AnalysisConfiguration
        config={config}
        onConfigChange={setConfig}
      />

      {/* Bouton de lancement */}
      <CometCard>
        <div className="p-4 text-center">
          <StatefulButton
            onClick={handleStartAnalysis}
            loading={loading}
            success={!!results}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
            disabled={!selectedZone}
          >
            {loading ? 'Demo running...' : (results ? 'Demo completed' : 'Start demonstration')}
          </StatefulButton>
          
          {error && (
            <div className="mt-3 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {selectedZone && (
            <div className="mt-2 text-xs text-gray-600">
              Selected zone: {selectedZone.name}
            </div>
          )}
        </div>
      </CometCard>

      {/* Résultats */}
      <SurveillanceResults results={results} zone={selectedZone} />
    </div>
  )
}
