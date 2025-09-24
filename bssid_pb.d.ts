import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace bssid. */
export namespace bssid {

    /** Properties of a Location. */
    interface ILocation {

        /** Location lat */
        lat?: (number|Long|null);

        /** Location lon */
        lon?: (number|Long|null);

        /** Location hacc */
        hacc?: (number|null);

        /** Location zero */
        zero?: (number|null);

        /** Location altitude */
        altitude?: (number|null);

        /** Location vacc */
        vacc?: (number|null);

        /** Location unk1 */
        unk1?: (number|null);

        /** Location unk2 */
        unk2?: (number|null);
    }

    /** Represents a Location. */
    class Location implements ILocation {

        /**
         * Constructs a new Location.
         * @param [properties] Properties to set
         */
        constructor(properties?: bssid.ILocation);

        /** Location lat. */
        public lat: (number|Long);

        /** Location lon. */
        public lon: (number|Long);

        /** Location hacc. */
        public hacc: number;

        /** Location zero. */
        public zero: number;

        /** Location altitude. */
        public altitude: number;

        /** Location vacc. */
        public vacc: number;

        /** Location unk1. */
        public unk1: number;

        /** Location unk2. */
        public unk2: number;

        /**
         * Creates a new Location instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Location instance
         */
        public static create(properties?: bssid.ILocation): bssid.Location;

        /**
         * Encodes the specified Location message. Does not implicitly {@link bssid.Location.verify|verify} messages.
         * @param message Location message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: bssid.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Location message, length delimited. Does not implicitly {@link bssid.Location.verify|verify} messages.
         * @param message Location message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: bssid.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Location message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Location
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): bssid.Location;

        /**
         * Decodes a Location message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Location
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): bssid.Location;

        /**
         * Verifies a Location message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Location message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Location
         */
        public static fromObject(object: { [k: string]: any }): bssid.Location;

        /**
         * Creates a plain object from a Location message. Also converts values to other types if specified.
         * @param message Location
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: bssid.Location, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Location to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Location
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a BSSIDGeo. */
    interface IBSSIDGeo {

        /** BSSIDGeo bssid */
        bssid: string;

        /** BSSIDGeo location */
        location?: (bssid.ILocation|null);

        /** BSSIDGeo channel */
        channel?: (number|null);
    }

    /** Represents a BSSIDGeo. */
    class BSSIDGeo implements IBSSIDGeo {

        /**
         * Constructs a new BSSIDGeo.
         * @param [properties] Properties to set
         */
        constructor(properties?: bssid.IBSSIDGeo);

        /** BSSIDGeo bssid. */
        public bssid: string;

        /** BSSIDGeo location. */
        public location?: (bssid.ILocation|null);

        /** BSSIDGeo channel. */
        public channel: number;

        /**
         * Creates a new BSSIDGeo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BSSIDGeo instance
         */
        public static create(properties?: bssid.IBSSIDGeo): bssid.BSSIDGeo;

        /**
         * Encodes the specified BSSIDGeo message. Does not implicitly {@link bssid.BSSIDGeo.verify|verify} messages.
         * @param message BSSIDGeo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: bssid.IBSSIDGeo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BSSIDGeo message, length delimited. Does not implicitly {@link bssid.BSSIDGeo.verify|verify} messages.
         * @param message BSSIDGeo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: bssid.IBSSIDGeo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BSSIDGeo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BSSIDGeo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): bssid.BSSIDGeo;

        /**
         * Decodes a BSSIDGeo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns BSSIDGeo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): bssid.BSSIDGeo;

        /**
         * Verifies a BSSIDGeo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BSSIDGeo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BSSIDGeo
         */
        public static fromObject(object: { [k: string]: any }): bssid.BSSIDGeo;

        /**
         * Creates a plain object from a BSSIDGeo message. Also converts values to other types if specified.
         * @param message BSSIDGeo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: bssid.BSSIDGeo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BSSIDGeo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for BSSIDGeo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a WiFiLocation. */
    interface IWiFiLocation {

        /** WiFiLocation unk1 */
        unk1?: (number|Long|null);

        /** WiFiLocation wifi */
        wifi?: (bssid.IBSSIDGeo[]|null);

        /** WiFiLocation noise */
        noise?: (number|null);

        /** WiFiLocation single */
        single?: (number|null);

        /** WiFiLocation APIName */
        APIName?: (string|null);
    }

    /** Represents a WiFiLocation. */
    class WiFiLocation implements IWiFiLocation {

        /**
         * Constructs a new WiFiLocation.
         * @param [properties] Properties to set
         */
        constructor(properties?: bssid.IWiFiLocation);

        /** WiFiLocation unk1. */
        public unk1: (number|Long);

        /** WiFiLocation wifi. */
        public wifi: bssid.IBSSIDGeo[];

        /** WiFiLocation noise. */
        public noise: number;

        /** WiFiLocation single. */
        public single: number;

        /** WiFiLocation APIName. */
        public APIName: string;

        /**
         * Creates a new WiFiLocation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns WiFiLocation instance
         */
        public static create(properties?: bssid.IWiFiLocation): bssid.WiFiLocation;

        /**
         * Encodes the specified WiFiLocation message. Does not implicitly {@link bssid.WiFiLocation.verify|verify} messages.
         * @param message WiFiLocation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: bssid.IWiFiLocation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified WiFiLocation message, length delimited. Does not implicitly {@link bssid.WiFiLocation.verify|verify} messages.
         * @param message WiFiLocation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: bssid.IWiFiLocation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a WiFiLocation message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns WiFiLocation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): bssid.WiFiLocation;

        /**
         * Decodes a WiFiLocation message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns WiFiLocation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): bssid.WiFiLocation;

        /**
         * Verifies a WiFiLocation message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a WiFiLocation message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns WiFiLocation
         */
        public static fromObject(object: { [k: string]: any }): bssid.WiFiLocation;

        /**
         * Creates a plain object from a WiFiLocation message. Also converts values to other types if specified.
         * @param message WiFiLocation
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: bssid.WiFiLocation, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this WiFiLocation to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for WiFiLocation
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
