const { geolocateApple } = require('../lib/geolocate');

function isValidBssid(bssid) {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(bssid);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  try {
    const { bssid } = req.body || {};
    if (!bssid || !isValidBssid(bssid)) {
      return res.status(400).json({ success: false, message: 'BSSID invalide. Format attendu: HH:HH:HH:HH:HH:HH' });
    }
    const results = await geolocateApple(String(bssid).toLowerCase());
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


