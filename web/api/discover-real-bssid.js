const { geolocateApple } = require('../lib/geolocate.js');

function isValidBssid(bssid) {
  // More flexible BSSID validation - accepts various formats
  const cleanBssid = String(bssid).replace(/[^0-9A-Fa-f]/g, '');
  return cleanBssid.length === 12 && /^[0-9A-Fa-f]{12}$/.test(cleanBssid);
}

function normalizeBssid(bssid) {
  // Clean and normalize BSSID to standard format
  const cleanBssid = String(bssid).replace(/[^0-9A-Fa-f]/g, '').toLowerCase();
  if (cleanBssid.length !== 12) return null;
  return cleanBssid.match(/.{2}/g).join(':');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { bssid } = req.body || {};
    
        if (!bssid || !isValidBssid(bssid)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid BSSID format. Please enter 12 hexadecimal characters (e.g., 001122334455 or 00:11:22:33:44:55)' 
          });
        }

        const normalizedBssid = normalizeBssid(bssid);
        console.log(`🎯 Precise discovery around real iPhone BSSID: ${normalizedBssid}`);
        console.log(`📱 Querying Apple for exact triangulation...`);
        
        // Query Apple with the real iPhone BSSID
        // Apple will return ALL networks it knows around this access point
        const allNetworks = await geolocateApple(normalizedBssid);
    
    if (!allNetworks || allNetworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun réseau trouvé pour ce BSSID. Vérifiez que le BSSID est correct et que vous êtes bien connecté à ce réseau.',
        requestedBSSID: bssid
      });
    }

    // Filtrer les réseaux valides (éliminer les sentinelles Apple -180,-180)
    const validNetworks = allNetworks.filter(network => 
      network && !isNaN(network.lat) && !isNaN(network.lon) && 
      network.lat !== -180 && network.lon !== -180
    );

    if (validNetworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Apple connaît ce BSSID mais aucune position valide n\'est disponible.',
        requestedBSSID: bssid,
        totalNetworksReturned: allNetworks.length
      });
    }

        // Trouver le réseau principal (celui demandé)
        const mainNetwork = validNetworks.find(network => 
          network.bssid.toLowerCase() === normalizedBssid.toLowerCase() || 
          network.paddedBSSID.toLowerCase() === normalizedBssid.toLowerCase()
        ) || validNetworks[0];

    // Calculer les statistiques
    const distances = validNetworks.map(network => {
      if (mainNetwork) {
        const distance = calculateDistance(
          mainNetwork.lat, mainNetwork.lon,
          network.lat, network.lon
        );
        return Math.round(distance * 1000); // en mètres
      }
      return 0;
    });

    const maxDistance = Math.max(...distances);
    const avgAccuracy = validNetworks.reduce((sum, net) => sum + (net.hacc || 0), 0) / validNetworks.length;

    console.log(`📡 Apple a retourné ${allNetworks.length} réseaux au total`);
    console.log(`✅ ${validNetworks.length} réseaux valides avec positions`);
    console.log(`🎯 Zone couverte: ${maxDistance}m de rayon`);

    return res.status(200).json({
      success: true,
      method: 'real_iphone_bssid_triangulation',
      requestedBSSID: bssid,
      mainNetwork: mainNetwork,
      networksFound: validNetworks.length,
      totalNetworksReturned: allNetworks.length,
      networks: validNetworks,
      statistics: {
        coverageRadius: maxDistance,
        averageAccuracy: Math.round(avgAccuracy),
        networkDensity: validNetworks.length,
        triangulationQuality: validNetworks.length > 50 ? 'excellent' : 
                             validNetworks.length > 20 ? 'bon' : 
                             validNetworks.length > 5 ? 'moyen' : 'faible'
      },
      message: `Triangulation iPhone réussie : ${validNetworks.length} réseaux découverts autour de votre position exacte (rayon ${maxDistance}m)`
    });
    
  } catch (error) {
    console.error('api/discover-real-bssid error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la découverte des réseaux via BSSID réel' 
    });
  }
};

// Fonction helper pour calculer la distance entre deux points GPS
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en km
}