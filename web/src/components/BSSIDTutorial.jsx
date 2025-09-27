import React, { useState, useEffect } from 'react'

// Hook pour détecter l'OS
function useOperatingSystem() {
  const [os, setOs] = useState('unknown')
  
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('win')) {
      setOs('windows')
    } else if (userAgent.includes('mac')) {
      setOs('mac')
    } else if (userAgent.includes('linux')) {
      setOs('linux')
    } else {
      setOs('unknown')
    }
  }, [])
  
  return os
}

// Composant pour copier du texte
function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
  
  return (
    <button
      onClick={handleCopy}
      className={`ml-2 px-3 py-1 text-xs rounded transition-colors ${
        copied 
          ? 'bg-green-100 text-green-800 border border-green-300' 
          : 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
      }`}
    >
      {copied ? '✓ Copied!' : '📋 Copy'}
    </button>
  )
}

// Composant principal du tutoriel
export default function BSSIDTutorial({ isOpen, onClose }) {
  const os = useOperatingSystem()
  
  if (!isOpen) return null
  
  // Commandes pour chaque OS
  const commands = {
    windows: {
      command: 'netsh wlan show interfaces',
      simpleCommand: 'netsh wlan show interfaces | findstr "SSID"',
      bssidOnly: '((netsh wlan show interfaces | Select-String "([0-9a-f]{2}:){5}[0-9a-f]{2}" -AllMatches).Matches.Value)[1]',
      steps: [
        'Open Command Prompt (cmd)',
        'Make sure you\'re connected to WiFi',
        'Run the command to get your current BSSID'
      ]
    },
    mac: {
      command: '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I',
      simpleCommand: '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep BSSID',
      bssidOnly: '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk \'/BSSID/ {print $2}\'',
      steps: [
        'Open Terminal (Applications > Utilities > Terminal)',
        'Make sure you\'re connected to your WiFi network',
        'Run the command to get your BSSID'
      ]
    },
    linux: {
      command: 'iwconfig',
      simpleCommand: 'iwconfig | grep "Access Point"',
      bssidOnly: 'iwconfig 2>/dev/null | grep "Access Point" | awk \'{print $6}\' | grep -v "Not-Associated"',
      steps: [
        'Open Terminal',
        'Make sure you\'re connected to your WiFi network',
        'Run the command to get your BSSID'
      ]
    }
  }
  
  const currentCommands = commands[os] || commands.windows
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">📖</span>
              How to Find Your BSSID
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-6">
            {/* OS Detection */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                🖥️ Detected OS: {os.charAt(0).toUpperCase() + os.slice(1)}
              </h3>
              <p className="text-sm text-blue-700">
                Commands below are optimized for your operating system.
              </p>
            </div>
            
            {/* What is BSSID */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                🔍 What is a BSSID?
              </h3>
              <p className="text-sm text-gray-700">
                BSSID (Basic Service Set Identifier) is the MAC address of your WiFi router's radio. 
                It uniquely identifies your access point and is used for geolocation services.
              </p>
            </div>
            
            {/* Steps */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">📋 Step-by-step instructions:</h3>
              
              {currentCommands.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
            
            {/* Commands */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">💻 Commands:</h3>
              
              {/* Full info command */}
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-gray-400 mb-1">Full WiFi info:</div>
                    <code className="break-all">{currentCommands.command}</code>
                  </div>
                  <CopyButton text={currentCommands.command} />
                </div>
              </div>
              
              {/* BSSID only command */}
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-gray-400 mb-1">BSSID only (recommended):</div>
                    <code className="break-all">{currentCommands.bssidOnly}</code>
                  </div>
                  <CopyButton text={currentCommands.bssidOnly} />
                </div>
              </div>
            </div>
            
            {/* Example output */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">
                ✅ Expected output format:
              </h3>
              <div className="bg-white border rounded p-2 font-mono text-sm text-gray-800">
                aa:bb:cc:dd:ee:ff
              </div>
              <p className="text-xs text-green-700 mt-2">
                Copy this value and paste it into the BSSID field above.
              </p>
            </div>
            
            {/* Troubleshooting */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">
                ⚠️ Troubleshooting:
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Make sure you're connected to WiFi</li>
                <li>• On Windows, you may need to run Command Prompt as Administrator</li>
                <li>• The BSSID format should be: XX:XX:XX:XX:XX:XX</li>
                <li>• If command fails, try disconnecting and reconnecting to WiFi</li>
              </ul>
            </div>
            
            {/* Alternative methods */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">
                📱 Alternative methods:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-medium text-blue-900">iPhone:</h4>
                  <p className="text-blue-700">Settings &gt; WiFi &gt; (i) next to connected network &gt; Copy BSSID</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <h4 className="font-medium text-green-900">Android:</h4>
                  <p className="text-green-700">Settings &gt; WiFi &gt; Connected network &gt; Advanced &gt; BSSID</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
