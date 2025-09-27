#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { geolocateApple } = require('./lib/geolocate');

// OUIs IEEE officiels pour l'analyse 
const COMMON_OUIS = [
  '00:1A:2B', // Exemple générique
  '74:24:9F', // Starlink/TIBRO Corp
  '00:50:56', // VMware
  '00:0C:29', // VMware
  '08:00:27', // Oracle VirtualBox
  '00:16:3E', // Xen
  '52:54:00', // QEMU/KVM
  '00:15:5D', // Microsoft Hyper-V
  '00:05:69', // VMware
  '00:1C:14', // VMware
];

// Fonction pour générer des BSSIDs aléatoires pour un OUI
function generateRandomBSSIDs(oui, count = 100) {
  const bssids = [];
  for (let i = 0; i < count; i++) {
    const random = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    bssids.push(`${oui}:${random.substring(0, 2)}:${random.substring(2, 4)}:${random.substring(4, 6)}`);
  }
  return bssids;
}

// Fonction pour vérifier si des coordonnées sont dans une zone
function isInZone(lat, lon, zone) {
  if (!zone.coordinates) return false;
  const [[minLat, minLon], [maxLat, maxLon]] = zone.coordinates;
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
}

// Fonction pour calculer la distance entre deux points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

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

// Endpoint pour surveillance géographique (démonstration éducative)
app.post('/api/geographical-surveillance', async (req, res) => {
  try {
    const { zone, config } = req.body || {};
    
    if (!zone || !zone.coordinates) {
      return res.status(400).json({ 
        success: false, 
        message: 'Geographical zone required with coordinates' 
      });
    }

    console.log(`🎓 Geographical surveillance demonstration for ${zone.name}`);
    
    // Realistic simulation for educational demonstration
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000)); // 2-5 seconds
    
    // Generate realistic data based on zone
    const results = generateRealisticDemoData(zone, config);
    
    console.log(`✅ Demonstration completed: ${results.totalBSSIDs} simulated BSSIDs, ${results.movements.length} movements detected`);
    
    return res.status(200).json({
      success: true,
      zone: zone.name,
      results: results,
      timestamp: new Date().toISOString(),
      message: `Demonstration completed: ${results.totalBSSIDs} BSSIDs analyzed, ${results.movements.length} movements detected`,
      disclaimer: "⚠️ Simulated data for educational purposes only"
    });
    
  } catch (error) {
    console.error('❌ Geographical surveillance demo error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Demonstration error: ' + error.message 
    });
  }
});

// Fonction pour générer des données de démonstration réalistes
function generateRealisticDemoData(zone, config) {
  const results = {
    totalBSSIDs: Math.floor(Math.random() * 15000) + 8000, // 8k-23k BSSIDs
    movements: [],
    origins: [],
    ouiAnalysis: {
      starlink: 0,
      military: 0,
      civilian: 0
    },
    timeline: [],
    phases: []
  };

  // Phase 1: Bootstrap par OUIs (simulation des résultats)
  if (config.ouiBootstrap) {
    results.phases.push({
      phase: "Bootstrap par OUIs IEEE",
      description: `Test de ${COMMON_OUIS.length} OUIs avec génération de BSSIDs aléatoires`,
      bssidsGenerated: COMMON_OUIS.length * 20,
      bssidsFound: Math.floor(results.totalBSSIDs * 0.3)
    });
  }

  // Phase 2: Expansion nearby
  if (config.nearbyExpansion) {
    results.phases.push({
      phase: "Expansion par BSSIDs nearby",
      description: "Utilisation des ~400 BSSIDs nearby retournés par Apple",
      bssidsExpanded: Math.floor(results.totalBSSIDs * 0.7)
    });
  }

  // Générer des mouvements réalistes selon la zone
  const movementPatterns = getMovementPatternsForZone(zone);
  
  movementPatterns.forEach((pattern, index) => {
    if (Math.random() > 0.3) { // 70% de chance pour chaque pattern
      const distance = calculateDistance(pattern.from.lat, pattern.from.lon, pattern.to.lat, pattern.to.lon);
      
      if (distance > (config.movementThreshold || 1)) {
        results.movements.push({
          bssid: generateRandomBSSID(),
          from: pattern.from,
          to: pattern.to,
          distance: distance,
          timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Dernier mois
          confidence: Math.random() * 0.3 + 0.7, // 70-100% de confiance
          deviceType: pattern.deviceType || 'civilian'
        });
      }
    }
  });

  // Analyse des OUIs spécifiques
  results.ouiAnalysis.starlink = Math.floor(Math.random() * 50) + 15;
  results.ouiAnalysis.military = Math.floor(Math.random() * 200) + 80;
  results.ouiAnalysis.civilian = results.totalBSSIDs - results.ouiAnalysis.starlink - results.ouiAnalysis.military;

  // Analyse des origines basée sur les mouvements
  const originCities = [
    { city: 'Moscou', lat: 55.7558, lon: 37.6176, probability: 0.35 },
    { city: 'St-Petersbourg', lat: 59.9311, lon: 30.3609, probability: 0.25 },
    { city: 'Rostov-sur-le-Don', lat: 47.2357, lon: 39.7015, probability: 0.20 },
    { city: 'Krasnodar', lat: 45.0355, lon: 38.9753, probability: 0.12 },
    { city: 'Voronezh', lat: 51.6720, lon: 39.1843, probability: 0.08 }
  ];

  results.origins = originCities.map(origin => ({
    ...origin,
    count: Math.floor(results.movements.length * origin.probability * (0.5 + Math.random() * 0.5))
  })).filter(origin => origin.count > 0);

  return results;
}

// Patterns de mouvements réalistes selon la zone
function getMovementPatternsForZone(zone) {
  const patterns = [];
  
  if (zone.id === 'ukraine-east' || zone.id === 'crimea') {
    // Patterns typiques pour la région Ukraine/Russie
    patterns.push(
      // Moscou vers zone de conflit
      { from: {lat: 55.7558, lon: 37.6176}, to: {lat: 48.0196, lon: 37.8027}, deviceType: 'military' },
      { from: {lat: 55.7558, lon: 37.6176}, to: {lat: 47.1056, lon: 37.5492}, deviceType: 'military' },
      
      // St-Petersbourg vers zone
      { from: {lat: 59.9311, lon: 30.3609}, to: {lat: 48.0196, lon: 37.8027}, deviceType: 'civilian' },
      { from: {lat: 59.9311, lon: 30.3609}, to: {lat: 47.1056, lon: 37.5492}, deviceType: 'civilian' },
      
      // Rostov vers zone (proximité géographique)
      { from: {lat: 47.2357, lon: 39.7015}, to: {lat: 48.0196, lon: 37.8027}, deviceType: 'military' },
      { from: {lat: 47.2357, lon: 39.7015}, to: {lat: 47.1056, lon: 37.5492}, deviceType: 'military' },
      
      // Krasnodar vers zone
      { from: {lat: 45.0355, lon: 38.9753}, to: {lat: 47.1056, lon: 37.5492}, deviceType: 'civilian' },
      
      // Mouvements internes dans la zone
      { from: {lat: 48.0196, lon: 37.8027}, to: {lat: 47.1056, lon: 37.5492}, deviceType: 'military' },
      { from: {lat: 47.1056, lon: 37.5492}, to: {lat: 46.9684, lon: 37.4138}, deviceType: 'military' },
    );
  }
  
  return patterns;
}

// Générer un BSSID aléatoire réaliste
function generateRandomBSSID() {
  const ouis = ['00:1a:2b', '74:24:9f', '00:50:56', '00:0c:29', '08:00:27'];
  const oui = ouis[Math.floor(Math.random() * ouis.length)];
  const suffix = Array.from({length: 3}, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join(':');
  return `${oui}:${suffix}`;
}

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


