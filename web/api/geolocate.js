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
      return res.status(400).json({ success: false, message: 'Invalid BSSID format. Please enter 12 hexadecimal characters (e.g., 001122334455 or 00:11:22:33:44:55)' });
    }
    const normalizedBssid = normalizeBssid(bssid);
    const results = await geolocateApple(normalizedBssid);
    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucune localisation trouvée pour ce BSSID.' });
    }
    const firstValid = results.find(r => r && !isNaN(r.lat) && !isNaN(r.lon) && r.lat !== -180 && r.lon !== -180) || results[0];
    return res.status(200).json({ success: true, location: firstValid });
  } catch (e) {
    console.error('api/geolocate error', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};