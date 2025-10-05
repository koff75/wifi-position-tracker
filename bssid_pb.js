/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.bssid = (function() {

    /**
     * Namespace bssid.
     * @exports bssid
     * @namespace
     */
    var bssid = {};

    bssid.Location = (function() {

        /**
         * Properties of a Location.
         * @memberof bssid
         * @interface ILocation
         * @property {number|Long|null} [lat] Location lat
         * @property {number|Long|null} [lon] Location lon
         * @property {number|null} [hacc] Location hacc
         * @property {number|null} [zero] Location zero
         * @property {number|null} [altitude] Location altitude
         * @property {number|null} [vacc] Location vacc
         * @property {number|null} [unk1] Location unk1
         * @property {number|null} [unk2] Location unk2
         */

        /**
         * Constructs a new Location.
         * @memberof bssid
         * @classdesc Represents a Location.
         * @implements ILocation
         * @constructor
         * @param {bssid.ILocation=} [properties] Properties to set
         */
        function Location(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Location lat.
         * @member {number|Long} lat
         * @memberof bssid.Location
         * @instance
         */
        Location.prototype.lat = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Location lon.
         * @member {number|Long} lon
         * @memberof bssid.Location
         * @instance
         */
        Location.prototype.lon = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Location hacc.
         * @member {number} hacc
         * @memberof bssid.Location
         * @instance
         */
        Location.prototype.hacc = 0;

        /**
         * Location zero.
         * @member {number} zero
         * @memberof bssid.Location
         * @instance
         */
        Location.prototype.zero = 0;

        /**
         * Location altitude.
         * @member {number} altitude
         * @memberof bssid.Location
         * @instance
         */
        Location.prototype.altitude = 0;

        /**
         * Location vacc.
         * @member {number} vacc
         * @memberof bssid.Location
         * @instance
         */
        Location.prototype.vacc = 0;

        /**
         * Location unk1.
         * @member {number} unk1
         * @memberof bssid.Location
         * @instance
         */
        Location.prototype.unk1 = 0;

        /**
         * Location unk2.
         * @member {number} unk2
         * @memberof bssid.Location
         * @instance
         */
        Location.prototype.unk2 = 0;

        /**
         * Creates a new Location instance using the specified properties.
         * @function create
         * @memberof bssid.Location
         * @static
         * @param {bssid.ILocation=} [properties] Properties to set
         * @returns {bssid.Location} Location instance
         */
        Location.create = function create(properties) {
            return new Location(properties);
        };

        /**
         * Encodes the specified Location message. Does not implicitly {@link bssid.Location.verify|verify} messages.
         * @function encode
         * @memberof bssid.Location
         * @static
         * @param {bssid.ILocation} message Location message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Location.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.lat != null && Object.hasOwnProperty.call(message, "lat"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.lat);
            if (message.lon != null && Object.hasOwnProperty.call(message, "lon"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.lon);
            if (message.hacc != null && Object.hasOwnProperty.call(message, "hacc"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.hacc);
            if (message.zero != null && Object.hasOwnProperty.call(message, "zero"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.zero);
            if (message.altitude != null && Object.hasOwnProperty.call(message, "altitude"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.altitude);
            if (message.vacc != null && Object.hasOwnProperty.call(message, "vacc"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.vacc);
            if (message.unk1 != null && Object.hasOwnProperty.call(message, "unk1"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.unk1);
            if (message.unk2 != null && Object.hasOwnProperty.call(message, "unk2"))
                writer.uint32(/* id 8, wireType 0 =*/64).int32(message.unk2);
            return writer;
        };

        /**
         * Encodes the specified Location message, length delimited. Does not implicitly {@link bssid.Location.verify|verify} messages.
         * @function encodeDelimited
         * @memberof bssid.Location
         * @static
         * @param {bssid.ILocation} message Location message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Location.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Location message from the specified reader or buffer.
         * @function decode
         * @memberof bssid.Location
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {bssid.Location} Location
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Location.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bssid.Location();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.lat = reader.int64();
                        break;
                    }
                case 2: {
                        message.lon = reader.int64();
                        break;
                    }
                case 3: {
                        message.hacc = reader.int32();
                        break;
                    }
                case 4: {
                        message.zero = reader.int32();
                        break;
                    }
                case 5: {
                        message.altitude = reader.int32();
                        break;
                    }
                case 6: {
                        message.vacc = reader.int32();
                        break;
                    }
                case 7: {
                        message.unk1 = reader.int32();
                        break;
                    }
                case 8: {
                        message.unk2 = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Location message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof bssid.Location
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {bssid.Location} Location
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Location.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Location message.
         * @function verify
         * @memberof bssid.Location
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Location.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.lat != null && message.hasOwnProperty("lat"))
                if (!$util.isInteger(message.lat) && !(message.lat && $util.isInteger(message.lat.low) && $util.isInteger(message.lat.high)))
                    return "lat: integer|Long expected";
            if (message.lon != null && message.hasOwnProperty("lon"))
                if (!$util.isInteger(message.lon) && !(message.lon && $util.isInteger(message.lon.low) && $util.isInteger(message.lon.high)))
                    return "lon: integer|Long expected";
            if (message.hacc != null && message.hasOwnProperty("hacc"))
                if (!$util.isInteger(message.hacc))
                    return "hacc: integer expected";
            if (message.zero != null && message.hasOwnProperty("zero"))
                if (!$util.isInteger(message.zero))
                    return "zero: integer expected";
            if (message.altitude != null && message.hasOwnProperty("altitude"))
                if (!$util.isInteger(message.altitude))
                    return "altitude: integer expected";
            if (message.vacc != null && message.hasOwnProperty("vacc"))
                if (!$util.isInteger(message.vacc))
                    return "vacc: integer expected";
            if (message.unk1 != null && message.hasOwnProperty("unk1"))
                if (!$util.isInteger(message.unk1))
                    return "unk1: integer expected";
            if (message.unk2 != null && message.hasOwnProperty("unk2"))
                if (!$util.isInteger(message.unk2))
                    return "unk2: integer expected";
            return null;
        };

        /**
         * Creates a Location message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof bssid.Location
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {bssid.Location} Location
         */
        Location.fromObject = function fromObject(object) {
            if (object instanceof $root.bssid.Location)
                return object;
            var message = new $root.bssid.Location();
            if (object.lat != null)
                if ($util.Long)
                    (message.lat = $util.Long.fromValue(object.lat)).unsigned = false;
                else if (typeof object.lat === "string")
                    message.lat = parseInt(object.lat, 10);
                else if (typeof object.lat === "number")
                    message.lat = object.lat;
                else if (typeof object.lat === "object")
                    message.lat = new $util.LongBits(object.lat.low >>> 0, object.lat.high >>> 0).toNumber();
            if (object.lon != null)
                if ($util.Long)
                    (message.lon = $util.Long.fromValue(object.lon)).unsigned = false;
                else if (typeof object.lon === "string")
                    message.lon = parseInt(object.lon, 10);
                else if (typeof object.lon === "number")
                    message.lon = object.lon;
                else if (typeof object.lon === "object")
                    message.lon = new $util.LongBits(object.lon.low >>> 0, object.lon.high >>> 0).toNumber();
            if (object.hacc != null)
                message.hacc = object.hacc | 0;
            if (object.zero != null)
                message.zero = object.zero | 0;
            if (object.altitude != null)
                message.altitude = object.altitude | 0;
            if (object.vacc != null)
                message.vacc = object.vacc | 0;
            if (object.unk1 != null)
                message.unk1 = object.unk1 | 0;
            if (object.unk2 != null)
                message.unk2 = object.unk2 | 0;
            return message;
        };

        /**
         * Creates a plain object from a Location message. Also converts values to other types if specified.
         * @function toObject
         * @memberof bssid.Location
         * @static
         * @param {bssid.Location} message Location
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Location.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.lat = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lat = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.lon = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lon = options.longs === String ? "0" : 0;
                object.hacc = 0;
                object.zero = 0;
                object.altitude = 0;
                object.vacc = 0;
                object.unk1 = 0;
                object.unk2 = 0;
            }
            if (message.lat != null && message.hasOwnProperty("lat"))
                if (typeof message.lat === "number")
                    object.lat = options.longs === String ? String(message.lat) : message.lat;
                else
                    object.lat = options.longs === String ? $util.Long.prototype.toString.call(message.lat) : options.longs === Number ? new $util.LongBits(message.lat.low >>> 0, message.lat.high >>> 0).toNumber() : message.lat;
            if (message.lon != null && message.hasOwnProperty("lon"))
                if (typeof message.lon === "number")
                    object.lon = options.longs === String ? String(message.lon) : message.lon;
                else
                    object.lon = options.longs === String ? $util.Long.prototype.toString.call(message.lon) : options.longs === Number ? new $util.LongBits(message.lon.low >>> 0, message.lon.high >>> 0).toNumber() : message.lon;
            if (message.hacc != null && message.hasOwnProperty("hacc"))
                object.hacc = message.hacc;
            if (message.zero != null && message.hasOwnProperty("zero"))
                object.zero = message.zero;
            if (message.altitude != null && message.hasOwnProperty("altitude"))
                object.altitude = message.altitude;
            if (message.vacc != null && message.hasOwnProperty("vacc"))
                object.vacc = message.vacc;
            if (message.unk1 != null && message.hasOwnProperty("unk1"))
                object.unk1 = message.unk1;
            if (message.unk2 != null && message.hasOwnProperty("unk2"))
                object.unk2 = message.unk2;
            return object;
        };

        /**
         * Converts this Location to JSON.
         * @function toJSON
         * @memberof bssid.Location
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Location.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Location
         * @function getTypeUrl
         * @memberof bssid.Location
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Location.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/bssid.Location";
        };

        return Location;
    })();

    bssid.BSSIDGeo = (function() {

        /**
         * Properties of a BSSIDGeo.
         * @memberof bssid
         * @interface IBSSIDGeo
         * @property {string} bssid BSSIDGeo bssid
         * @property {bssid.ILocation|null} [location] BSSIDGeo location
         * @property {number|null} [channel] BSSIDGeo channel
         */

        /**
         * Constructs a new BSSIDGeo.
         * @memberof bssid
         * @classdesc Represents a BSSIDGeo.
         * @implements IBSSIDGeo
         * @constructor
         * @param {bssid.IBSSIDGeo=} [properties] Properties to set
         */
        function BSSIDGeo(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BSSIDGeo bssid.
         * @member {string} bssid
         * @memberof bssid.BSSIDGeo
         * @instance
         */
        BSSIDGeo.prototype.bssid = "";

        /**
         * BSSIDGeo location.
         * @member {bssid.ILocation|null|undefined} location
         * @memberof bssid.BSSIDGeo
         * @instance
         */
        BSSIDGeo.prototype.location = null;

        /**
         * BSSIDGeo channel.
         * @member {number} channel
         * @memberof bssid.BSSIDGeo
         * @instance
         */
        BSSIDGeo.prototype.channel = 0;

        /**
         * Creates a new BSSIDGeo instance using the specified properties.
         * @function create
         * @memberof bssid.BSSIDGeo
         * @static
         * @param {bssid.IBSSIDGeo=} [properties] Properties to set
         * @returns {bssid.BSSIDGeo} BSSIDGeo instance
         */
        BSSIDGeo.create = function create(properties) {
            return new BSSIDGeo(properties);
        };

        /**
         * Encodes the specified BSSIDGeo message. Does not implicitly {@link bssid.BSSIDGeo.verify|verify} messages.
         * @function encode
         * @memberof bssid.BSSIDGeo
         * @static
         * @param {bssid.IBSSIDGeo} message BSSIDGeo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BSSIDGeo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.bssid);
            if (message.location != null && Object.hasOwnProperty.call(message, "location"))
                $root.bssid.Location.encode(message.location, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.channel != null && Object.hasOwnProperty.call(message, "channel"))
                writer.uint32(/* id 21, wireType 0 =*/168).int32(message.channel);
            return writer;
        };

        /**
         * Encodes the specified BSSIDGeo message, length delimited. Does not implicitly {@link bssid.BSSIDGeo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof bssid.BSSIDGeo
         * @static
         * @param {bssid.IBSSIDGeo} message BSSIDGeo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BSSIDGeo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BSSIDGeo message from the specified reader or buffer.
         * @function decode
         * @memberof bssid.BSSIDGeo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {bssid.BSSIDGeo} BSSIDGeo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BSSIDGeo.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bssid.BSSIDGeo();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.bssid = reader.string();
                        break;
                    }
                case 2: {
                        message.location = $root.bssid.Location.decode(reader, reader.uint32());
                        break;
                    }
                case 21: {
                        message.channel = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("bssid"))
                throw $util.ProtocolError("missing required 'bssid'", { instance: message });
            return message;
        };

        /**
         * Decodes a BSSIDGeo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof bssid.BSSIDGeo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {bssid.BSSIDGeo} BSSIDGeo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BSSIDGeo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BSSIDGeo message.
         * @function verify
         * @memberof bssid.BSSIDGeo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BSSIDGeo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.bssid))
                return "bssid: string expected";
            if (message.location != null && message.hasOwnProperty("location")) {
                var error = $root.bssid.Location.verify(message.location);
                if (error)
                    return "location." + error;
            }
            if (message.channel != null && message.hasOwnProperty("channel"))
                if (!$util.isInteger(message.channel))
                    return "channel: integer expected";
            return null;
        };

        /**
         * Creates a BSSIDGeo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof bssid.BSSIDGeo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {bssid.BSSIDGeo} BSSIDGeo
         */
        BSSIDGeo.fromObject = function fromObject(object) {
            if (object instanceof $root.bssid.BSSIDGeo)
                return object;
            var message = new $root.bssid.BSSIDGeo();
            if (object.bssid != null)
                message.bssid = String(object.bssid);
            if (object.location != null) {
                if (typeof object.location !== "object")
                    throw TypeError(".bssid.BSSIDGeo.location: object expected");
                message.location = $root.bssid.Location.fromObject(object.location);
            }
            if (object.channel != null)
                message.channel = object.channel | 0;
            return message;
        };

        /**
         * Creates a plain object from a BSSIDGeo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof bssid.BSSIDGeo
         * @static
         * @param {bssid.BSSIDGeo} message BSSIDGeo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BSSIDGeo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.bssid = "";
                object.location = null;
                object.channel = 0;
            }
            if (message.bssid != null && message.hasOwnProperty("bssid"))
                object.bssid = message.bssid;
            if (message.location != null && message.hasOwnProperty("location"))
                object.location = $root.bssid.Location.toObject(message.location, options);
            if (message.channel != null && message.hasOwnProperty("channel"))
                object.channel = message.channel;
            return object;
        };

        /**
         * Converts this BSSIDGeo to JSON.
         * @function toJSON
         * @memberof bssid.BSSIDGeo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BSSIDGeo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for BSSIDGeo
         * @function getTypeUrl
         * @memberof bssid.BSSIDGeo
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        BSSIDGeo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/bssid.BSSIDGeo";
        };

        return BSSIDGeo;
    })();

    bssid.WiFiLocation = (function() {

        /**
         * Properties of a WiFiLocation.
         * @memberof bssid
         * @interface IWiFiLocation
         * @property {number|Long|null} [unk1] WiFiLocation unk1
         * @property {Array.<bssid.IBSSIDGeo>|null} [wifi] WiFiLocation wifi
         * @property {number|null} [noise] WiFiLocation noise
         * @property {number|null} [single] WiFiLocation single
         * @property {string|null} [APIName] WiFiLocation APIName
         */

        /**
         * Constructs a new WiFiLocation.
         * @memberof bssid
         * @classdesc Represents a WiFiLocation.
         * @implements IWiFiLocation
         * @constructor
         * @param {bssid.IWiFiLocation=} [properties] Properties to set
         */
        function WiFiLocation(properties) {
            this.wifi = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WiFiLocation unk1.
         * @member {number|Long} unk1
         * @memberof bssid.WiFiLocation
         * @instance
         */
        WiFiLocation.prototype.unk1 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * WiFiLocation wifi.
         * @member {Array.<bssid.IBSSIDGeo>} wifi
         * @memberof bssid.WiFiLocation
         * @instance
         */
        WiFiLocation.prototype.wifi = $util.emptyArray;

        /**
         * WiFiLocation noise.
         * @member {number} noise
         * @memberof bssid.WiFiLocation
         * @instance
         */
        WiFiLocation.prototype.noise = 0;

        /**
         * WiFiLocation single.
         * @member {number} single
         * @memberof bssid.WiFiLocation
         * @instance
         */
        WiFiLocation.prototype.single = 0;

        /**
         * WiFiLocation APIName.
         * @member {string} APIName
         * @memberof bssid.WiFiLocation
         * @instance
         */
        WiFiLocation.prototype.APIName = "";

        /**
         * Creates a new WiFiLocation instance using the specified properties.
         * @function create
         * @memberof bssid.WiFiLocation
         * @static
         * @param {bssid.IWiFiLocation=} [properties] Properties to set
         * @returns {bssid.WiFiLocation} WiFiLocation instance
         */
        WiFiLocation.create = function create(properties) {
            return new WiFiLocation(properties);
        };

        /**
         * Encodes the specified WiFiLocation message. Does not implicitly {@link bssid.WiFiLocation.verify|verify} messages.
         * @function encode
         * @memberof bssid.WiFiLocation
         * @static
         * @param {bssid.IWiFiLocation} message WiFiLocation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WiFiLocation.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.unk1 != null && Object.hasOwnProperty.call(message, "unk1"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.unk1);
            if (message.wifi != null && message.wifi.length)
                for (var i = 0; i < message.wifi.length; ++i)
                    $root.bssid.BSSIDGeo.encode(message.wifi[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.noise != null && Object.hasOwnProperty.call(message, "noise"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.noise);
            if (message.single != null && Object.hasOwnProperty.call(message, "single"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.single);
            if (message.APIName != null && Object.hasOwnProperty.call(message, "APIName"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.APIName);
            return writer;
        };

        /**
         * Encodes the specified WiFiLocation message, length delimited. Does not implicitly {@link bssid.WiFiLocation.verify|verify} messages.
         * @function encodeDelimited
         * @memberof bssid.WiFiLocation
         * @static
         * @param {bssid.IWiFiLocation} message WiFiLocation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WiFiLocation.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WiFiLocation message from the specified reader or buffer.
         * @function decode
         * @memberof bssid.WiFiLocation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {bssid.WiFiLocation} WiFiLocation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WiFiLocation.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.bssid.WiFiLocation();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.unk1 = reader.int64();
                        break;
                    }
                case 2: {
                        if (!(message.wifi && message.wifi.length))
                            message.wifi = [];
                        message.wifi.push($root.bssid.BSSIDGeo.decode(reader, reader.uint32()));
                        break;
                    }
                case 3: {
                        message.noise = reader.int32();
                        break;
                    }
                case 4: {
                        message.single = reader.int32();
                        break;
                    }
                case 5: {
                        message.APIName = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WiFiLocation message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof bssid.WiFiLocation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {bssid.WiFiLocation} WiFiLocation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WiFiLocation.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WiFiLocation message.
         * @function verify
         * @memberof bssid.WiFiLocation
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WiFiLocation.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.unk1 != null && message.hasOwnProperty("unk1"))
                if (!$util.isInteger(message.unk1) && !(message.unk1 && $util.isInteger(message.unk1.low) && $util.isInteger(message.unk1.high)))
                    return "unk1: integer|Long expected";
            if (message.wifi != null && message.hasOwnProperty("wifi")) {
                if (!Array.isArray(message.wifi))
                    return "wifi: array expected";
                for (var i = 0; i < message.wifi.length; ++i) {
                    var error = $root.bssid.BSSIDGeo.verify(message.wifi[i]);
                    if (error)
                        return "wifi." + error;
                }
            }
            if (message.noise != null && message.hasOwnProperty("noise"))
                if (!$util.isInteger(message.noise))
                    return "noise: integer expected";
            if (message.single != null && message.hasOwnProperty("single"))
                if (!$util.isInteger(message.single))
                    return "single: integer expected";
            if (message.APIName != null && message.hasOwnProperty("APIName"))
                if (!$util.isString(message.APIName))
                    return "APIName: string expected";
            return null;
        };

        /**
         * Creates a WiFiLocation message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof bssid.WiFiLocation
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {bssid.WiFiLocation} WiFiLocation
         */
        WiFiLocation.fromObject = function fromObject(object) {
            if (object instanceof $root.bssid.WiFiLocation)
                return object;
            var message = new $root.bssid.WiFiLocation();
            if (object.unk1 != null)
                if ($util.Long)
                    (message.unk1 = $util.Long.fromValue(object.unk1)).unsigned = false;
                else if (typeof object.unk1 === "string")
                    message.unk1 = parseInt(object.unk1, 10);
                else if (typeof object.unk1 === "number")
                    message.unk1 = object.unk1;
                else if (typeof object.unk1 === "object")
                    message.unk1 = new $util.LongBits(object.unk1.low >>> 0, object.unk1.high >>> 0).toNumber();
            if (object.wifi) {
                if (!Array.isArray(object.wifi))
                    throw TypeError(".bssid.WiFiLocation.wifi: array expected");
                message.wifi = [];
                for (var i = 0; i < object.wifi.length; ++i) {
                    if (typeof object.wifi[i] !== "object")
                        throw TypeError(".bssid.WiFiLocation.wifi: object expected");
                    message.wifi[i] = $root.bssid.BSSIDGeo.fromObject(object.wifi[i]);
                }
            }
            if (object.noise != null)
                message.noise = object.noise | 0;
            if (object.single != null)
                message.single = object.single | 0;
            if (object.APIName != null)
                message.APIName = String(object.APIName);
            return message;
        };

        /**
         * Creates a plain object from a WiFiLocation message. Also converts values to other types if specified.
         * @function toObject
         * @memberof bssid.WiFiLocation
         * @static
         * @param {bssid.WiFiLocation} message WiFiLocation
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WiFiLocation.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.wifi = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.unk1 = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.unk1 = options.longs === String ? "0" : 0;
                object.noise = 0;
                object.single = 0;
                object.APIName = "";
            }
            if (message.unk1 != null && message.hasOwnProperty("unk1"))
                if (typeof message.unk1 === "number")
                    object.unk1 = options.longs === String ? String(message.unk1) : message.unk1;
                else
                    object.unk1 = options.longs === String ? $util.Long.prototype.toString.call(message.unk1) : options.longs === Number ? new $util.LongBits(message.unk1.low >>> 0, message.unk1.high >>> 0).toNumber() : message.unk1;
            if (message.wifi && message.wifi.length) {
                object.wifi = [];
                for (var j = 0; j < message.wifi.length; ++j)
                    object.wifi[j] = $root.bssid.BSSIDGeo.toObject(message.wifi[j], options);
            }
            if (message.noise != null && message.hasOwnProperty("noise"))
                object.noise = message.noise;
            if (message.single != null && message.hasOwnProperty("single"))
                object.single = message.single;
            if (message.APIName != null && message.hasOwnProperty("APIName"))
                object.APIName = message.APIName;
            return object;
        };

        /**
         * Converts this WiFiLocation to JSON.
         * @function toJSON
         * @memberof bssid.WiFiLocation
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WiFiLocation.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WiFiLocation
         * @function getTypeUrl
         * @memberof bssid.WiFiLocation
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WiFiLocation.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/bssid.WiFiLocation";
        };

        return WiFiLocation;
    })();

    return bssid;
})();

module.exports = $root;
