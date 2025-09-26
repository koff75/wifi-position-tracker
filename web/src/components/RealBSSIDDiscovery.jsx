import React, { useState } from 'react'
import StatefulButton from './StatefulButton'

function RealBSSIDDiscovery({ onDiscoveryComplete }) {
  const [bssid, setBssid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const bssidRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
        if (!bssidRegex.test(bssid)) {
          setError('Invalid BSSID format. Use format HH:HH:HH:HH:HH:HH')
          setLoading(false)
          return
        }

    try {
      console.log('🎯 Discovery via real BSSID:', bssid)
      
      const response = await fetch('/api/discover-real-bssid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bssid })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Discovery error')
      }

      console.log('✅ Triangulation réussie:', data)
      onDiscoveryComplete({
        method: 'real_bssid',
        ...data
      })

    } catch (err) {
      console.error('BSSID discovery error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">📱</span>
        <div>
        <h3 className="text-xl font-bold text-gray-900">Real iPhone Triangulation</h3>
        <p className="text-sm text-gray-600">Discover ALL networks around your connected iPhone</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BSSID of your current WiFi network
          </label>
          <input
            type="text"
            value={bssid}
            onChange={(e) => setBssid(e.target.value)}
            placeholder="ex: 3a:07:16:a3:61:a4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Required format: HH:HH:HH:HH:HH:HH (with or without :)
          </p>
        </div>

        <StatefulButton
          type="submit"
          loading={loading}
          className="w-full"
          disabled={!bssid.trim()}
        >
          {loading ? 'Triangulation in progress...' : '🎯 Discover all surrounding networks'}
        </StatefulButton>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Bouton d'aide */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-sm text-purple-600 hover:text-purple-800 underline"
          >
            {showInstructions ? '📱 Hide instructions' : '❓ How to find my BSSID?'}
          </button>
        </div>

        {/* Instructions détaillées */}
        {showInstructions && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-gray-900">📱 Instructions by device:</h4>
            
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <h5 className="font-medium text-blue-900">🍎 iPhone / iPad</h5>
                <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                  <li>Open <strong>Settings</strong></li>
                  <li>Tap <strong>WiFi</strong></li>
                  <li>Tap the <strong>(i)</strong> next to your connected network</li>
                  <li>Copy the displayed <strong>BSSID</strong></li>
                </ol>
              </div>

              <div className="border-l-4 border-green-500 pl-3">
                <h5 className="font-medium text-green-900">🤖 Android</h5>
                <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                  <li>Open <strong>Settings</strong></li>
                  <li>Tap <strong>WiFi</strong></li>
                  <li>Tap your connected network</li>
                  <li>Tap <strong>Advanced</strong> or <strong>Details</strong></li>
                  <li>Find and copy the <strong>router MAC address</strong> or <strong>BSSID</strong></li>
                </ol>
              </div>

              <div className="border-l-4 border-gray-500 pl-3">
                <h5 className="font-medium text-gray-900">💻 Computer</h5>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Windows :</strong></p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    netsh wlan show profile "NomDeVotreRéseau" key=clear
                  </code>
                  
                  <p><strong>macOS:</strong></p>
                  <p>Option + Click on WiFi icon → Detailed information</p>
                  
                  <p><strong>Linux :</strong></p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    iwconfig | grep -i access
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> Make sure you're connected to the WiFi network 
                before copying the BSSID. The BSSID must match the router you're 
                currently connected to.
              </p>
            </div>
          </div>
        )}
      </form>

      <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <p><strong>🎯 How it works:</strong> By using the real BSSID of your connected network, 
        Apple can tell us precisely which other WiFi networks exist around you. 
        This is exactly what your iPhone does to geolocate itself!</p>
      </div>
    </div>
  )
}

export default RealBSSIDDiscovery
