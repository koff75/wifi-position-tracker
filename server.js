#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { geolocateApple } = require('./lib/geolocate');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function isValidBssid(bssid) {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(bssid);
}

app.post('/api/geolocate', async (req, res) => {
  try {
    const { bssid } = req.body || {};
    if (!bssid || !isValidBssid(bssid)) {
      return res.status(400).json({ success: false, message: 'BSSID invalide. Format attendu: HH:HH:HH:HH:HH:HH' });
    }

    const results = await geolocateApple(String(bssid).toLowerCase());
    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucune localisation trouvée pour ce BSSID.' });
    }

    // Filter out invalid networks (Apple's sentinel -180, -180)
    const allNetworks = results.filter(r => r && !(r.lat === -180 && r.lon === -180));

    // Check if we have any valid networks
    if (allNetworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'BSSID not found in Apple\'s database or location unavailable.',
        appleReturned: results.length,
        invalidNetworks: results.filter(r => r.lat === -180 && r.lon === -180).length
      });
    }

    // Find the requested network in the list
    const requestedNetwork = allNetworks.find(net => net.bssid.toLowerCase() === bssid.toLowerCase()) || allNetworks[0];

    return res.json({
      success: true,
      requestedBSSID: bssid,
      networksCollected: allNetworks.length,
      location: requestedNetwork, // The requested network or the first one
      allNetworks: allNetworks // ALL networks for privacy audit
    });
  } catch (err) {
    console.error('Erreur /api/geolocate:', err.message);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour triangulation iPhone avec BSSID réel
app.post('/api/discover-real-bssid', async (req, res) => {
  try {
    const { bssid } = req.body || {};
    
    if (!bssid || !isValidBssid(bssid)) {
      return res.status(400).json({ 
        success: false, 
        message: 'BSSID invalide. Format attendu: HH:HH:HH:HH:HH:HH' 
      });
    }

    console.log(`🎯 Triangulation iPhone avec BSSID: ${bssid}`);
    
    const allNetworks = await geolocateApple(bssid.toLowerCase());
    
    if (!allNetworks || allNetworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun réseau trouvé pour ce BSSID.',
        requestedBSSID: bssid
      });
    }

    const validNetworks = allNetworks.filter(network => 
      network && !isNaN(network.lat) && !isNaN(network.lon) && 
      network.lat !== -180 && network.lon !== -180
    );

    const mainNetwork = validNetworks.find(network => 
      network.bssid.toLowerCase() === bssid.toLowerCase() || 
      network.paddedBSSID.toLowerCase() === bssid.toLowerCase()
    ) || validNetworks[0];

    console.log(`✅ ${validNetworks.length} réseaux valides trouvés`);

    return res.status(200).json({
      success: true,
      method: 'real_iphone_bssid_triangulation',
      requestedBSSID: bssid,
      mainNetwork: mainNetwork,
      networksFound: validNetworks.length,
      totalNetworksReturned: allNetworks.length,
      networks: validNetworks,
      statistics: {
        coverageRadius: 1000,
        averageAccuracy: 25,
        networkDensity: validNetworks.length,
        triangulationQuality: validNetworks.length > 50 ? 'excellent' : 
                             validNetworks.length > 20 ? 'bon' : 'faible'
      },
      message: `Triangulation réussie : ${validNetworks.length} réseaux découverts`
    });
    
  } catch (error) {
    console.error('api/discover-real-bssid error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la triangulation' 
    });
  }
});

// Servir le frontend buildé si présent
const distDir = path.join(__dirname, 'web', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


