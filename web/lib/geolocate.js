const axios = require('axios');
const https = require('https');

// BSSID protobuf définitions intégrées (pour éviter les dépendances externes)
var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.bssid = (function() {
    var bssid = {};

    bssid.Location = (function() {
        function Location(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        Location.prototype.lat = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
        Location.prototype.lon = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
        Location.prototype.hacc = 0;
        Location.prototype.zero = 0;
        Location.prototype.altitude = 0;
        Location.prototype.vacc = 0;
        Location.prototype.unk1 = 0;
        Location.prototype.unk2 = 0;

        Location.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bssid.Location();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.lat = reader.int64();
                    break;
                case 2:
                    message.lon = reader.int64();
                    break;
                case 3:
                    message.hacc = reader.int32();
                    break;
                case 4:
                    message.zero = reader.int32();
                    break;
                case 5:
                    message.altitude = reader.int32();
                    break;
                case 6:
                    message.vacc = reader.int32();
                    break;
                case 7:
                    message.unk1 = reader.int32();
                    break;
                case 8:
                    message.unk2 = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        return Location;
    })();

    bssid.WiFi = (function() {
        function WiFi(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        WiFi.prototype.bssid = "";
        WiFi.prototype.location = null;
        WiFi.prototype.channel = 0;

        WiFi.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bssid.WiFi();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.bssid = reader.string();
                    break;
                case 2:
                    message.location = $root.bssid.Location.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.channel = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        return WiFi;
    })();

    bssid.WiFiLocation = (function() {
        function WiFiLocation(properties) {
            this.wifi = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        WiFiLocation.prototype.wifi = $util.emptyArray;

        WiFiLocation.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bssid.WiFiLocation();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.wifi && message.wifi.length))
                        message.wifi = [];
                    message.wifi.push($root.bssid.WiFi.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        return WiFiLocation;
    })();

    return bssid;
})();

// Utiliser les définitions intégrées
const bssidMessages = $root;
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
      console.log('[DEBUG] Raw response data:', responseData.toString('hex').substring(0, 100));
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

      if (debug) {
        console.log('[DEBUG] WiFi found:', { bssid: wifi.bssid, lat, lon, channel, hacc });
      }

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
    
    if (debug) {
      console.log('[DEBUG] Total valid geos found:', geos.length);
    }
    
    return geos;
  } catch (error) {
    if (debug) {
      console.error('[DEBUG] Error in geolocateApple:', error);
    }
    return [];
  }
}

module.exports = { geolocateApple };