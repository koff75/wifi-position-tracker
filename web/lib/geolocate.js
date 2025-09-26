const axios = require('axios');
const https = require('https');

let bssidMessages;
try {
  // From /web/lib/ to /web/bssid_pb.js
  bssidMessages = require('../bssid_pb.js');
} catch (error) {
  console.error("Erreur: Impossible de charger 'bssid_pb.js'. web/lib'.");
  throw error;
}

const WiFiLocation = bssidMessages.bssid.WiFiLocation;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function geolocateApple(bssid, { debug = false } = {}) {
  const bssidBytes = Buffer.from(bssid, 'ascii');
  const data_bssid_prefix = Buffer.from([0x12, 0x13, 0x0a, 0x11]);
  const data_bssid_suffix = Buffer.from([0x18, 0x00, 0x20, 0x00]);
  const data_bssid = Buffer.concat([data_bssid_prefix, bssidBytes, data_bssid_suffix]);

  const data_prefix = Buffer.from([
    0x00, 0x01, 0x00, 0x05, ...Buffer.from('en_US', 'ascii'), 0x00, 0x13,
    ...Buffer.from('com.apple.locationd', 'ascii'), 0x00, 0x0a,
    ...Buffer.from('8.1.12B411', 'ascii'), 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00,
  ]);
  const data_length_byte = Buffer.from([data_bssid.length]);

  const data = Buffer.concat([data_prefix, data_length_byte, data_bssid]);

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': '*/*',
    'Accept-Charset': 'utf-8',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-us',
    'User-Agent': 'locationd/1753.17 CFNetwork/711.1.12 Darwin/14.0.0',
  };

  const url = 'https://gs-loc.apple.com/clls/wloc';

  try {
    const requestTimestamp = Date.now();
    const response = await axios.post(url, data, {
      headers,
      httpsAgent,
      responseType: 'arraybuffer',
    });

    const responseData = Buffer.from(response.data).slice(10);
    if (debug) {
      console.log('[DEBUG] HTTP', response.status, 'bytes', Buffer.byteLength(response.data));
      console.log('[DEBUG] resp.slice10.len', responseData.length);
    }
    const bssidResponse = WiFiLocation.decode(responseData);
    if (debug) console.log('[DEBUG] decoded.wifi.count', (bssidResponse.wifi || []).length);

    const geos = [];
    for (const wifi of bssidResponse.wifi || []) {
      if (!wifi || typeof wifi.bssid !== 'string' || !wifi.location) continue;

      let paddedBSSID = wifi.bssid;
      try {
        paddedBSSID = wifi.bssid
          .split(':')
          .map(part => part.padStart(2, '0'))
          .join(':');
      } catch (_) {}

      const lat = (Number(wifi.location.lat) || 0) * Math.pow(10, -8);
      const lon = (Number(wifi.location.lon) || 0) * Math.pow(10, -8);
      const channel = wifi.channel ?? -1;
      const hacc = wifi.location.hacc ?? -1;

      let finalChannel = channel;
      let finalHacc = hacc;
      if (lat === -180 && lon === -180) {
        finalChannel = 0;
        finalHacc = -1;
        if (debug) console.log('[DEBUG] apple.sentinel.notFound', wifi.bssid);
      }

      // Only include valid networks (not Apple's sentinel values)
      if (lat !== -180 || lon !== -180) {
        geos.push({
          bssid: wifi.bssid,
          paddedBSSID,
          lat,
          lon,
          channel: finalChannel,
          hacc: finalHacc,
          timestamp: requestTimestamp,
        });
      }
    }
    return geos;
  } catch (error) {
    return [];
  }
}

module.exports = { geolocateApple };
