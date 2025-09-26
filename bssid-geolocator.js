#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');
const protobuf = require('protobufjs/minimal'); 
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { create } = require('xmlbuilder2'); 
const pLimitImport = require('p-limit');
const pLimit = pLimitImport.default || pLimitImport;
const inquirerImport = require('inquirer');
const inquirer = inquirerImport.default || inquirerImport;

let DEBUG = false;
function logDebug() {
    if (DEBUG) {
        console.log('[DEBUG]', ...arguments);
    }
}

let bssidMessages;
try {
    bssidMessages = require('./bssid_pb');
} catch (error) {
    console.error("Erreur: Impossible de charger 'bssid_pb.js'. Assurez-vous qu'il a été généré.");
    console.error("Lancez 'npm run generate-proto' ou réinstallez avec 'npm install'.");
    process.exit(1);
}
const BSSIDGeo = bssidMessages.bssid.BSSIDGeo;
const WiFiLocation = bssidMessages.bssid.WiFiLocation;

// Agent HTTPS pour ignorer les erreurs de certificat SSL
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const ETHICAL_WARNING = `
---------------------------------------------------------------------
Utilisez cet outil de manière responsable et uniquement à des fins
de recherche légitimes et autorisées.
---------------------------------------------------------------------
`;

/**
 * @brief Calcule la distance approximative entre deux points GPS en utilisant la formule Haversine.
 * @param {number} lat1 Latitude du point 1
 * @param {number} lon1 Longitude du point 1
 * @param {number} lat2 Latitude du point 2
 * @param {number} lon2 Longitude du point 2
 * @returns {number} Distance en kilomètres.
 */
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

/**
 * @brief Tente de géolocaliser un BSSID via l'API de localisation Apple.
 * @param {string} bssid - Le BSSID à géolocaliser.
 * @returns {Promise<Array<object>>} - Promesse résolvant vers une liste d'objets de localisation {bssid, paddedBSSID, lat, lon, channel, hacc, timestamp: Date.now()}
 */
async function geolocateApple(bssid) {
    // Construction du payload binaire
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
        "Accept-Charset": "utf-8",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-us",
        'User-Agent': 'locationd/1753.17 CFNetwork/711.1.12 Darwin/14.0.0'
    };

    const url = 'https://gs-loc.apple.com/clls/wloc';

    try {
        logDebug('POST', url, 'payloadBytes', data.length, 'bssid', bssid);
        const requestTimestamp = Date.now(); // Timestamp avant la requête
        const response = await axios.post(url, data, {
            headers: headers,
            httpsAgent: httpsAgent, // Utilisation de l'agent pour ignorer les erreurs SSL
            responseType: 'arraybuffer' // Récupération des données binaires
        });

        // Ignorer les 10 premiers octets de la réponse
        const responseData = Buffer.from(response.data).slice(10);
        logDebug('HTTP', response.status, 'contentLength', response.headers && (response.headers['content-length'] || response.headers['Content-Length']));
        logDebug('responseBytesAfterSlice', responseData.length);

        // Décoder le message Protobuf
        const bssidResponse = WiFiLocation.decode(responseData);
        logDebug('decoded.wifi.count', (bssidResponse.wifi || []).length);

        const geos = [];

        for (const wifi of bssidResponse.wifi || []) {
             // Vérifier la présence des données essentielles
             if (!wifi || typeof wifi.bssid !== 'string' || !wifi.location) {
                // console.warn(`Skipping incomplete wifi entry: ${JSON.stringify(wifi)}`);
                continue;
            }

            // Normaliser le BSSID (ajouter un zéro devant si nécessaire)
             let paddedBSSID = wifi.bssid; // Initialisation par défaut
             try {
                 paddedBSSID = wifi.bssid
                     .split(':')
                     .map(part => part.padStart(2, '0'))
                     .join(':');
             } catch (e) {
                 console.warn(`Failed to pad BSSID "${wifi.bssid}": ${e.message}. Using original.`);
             }

            // Latitude & Longitude (conversion depuis l'entier)
            const lat = (Number(wifi.location.lat) || 0) * Math.pow(10, -8);
            const lon = (Number(wifi.location.lon) || 0) * Math.pow(10, -8);

            // Canal Wi-Fi
            const channel = wifi.channel ?? -1;

            // Précision horizontale (mètres)
            const hacc = wifi.location.hacc ?? -1;

             // Cas spécifique si lat/lon = -180
             let finalChannel = channel;
             let finalHacc = hacc;
             if (lat === -180 && lon === -180) {
                 finalChannel = 0;
                 finalHacc = -1;
                logDebug('apple.sentinel.notFound', { bssid: wifi.bssid });
             }

            geos.push({
                bssid: wifi.bssid, // BSSID original retourné par l'API
                paddedBSSID: paddedBSSID, // BSSID normalisé
                lat: lat,
                lon: lon,
                channel: finalChannel,
                hacc: finalHacc,
                timestamp: requestTimestamp // Utiliser le timestamp de la requête
            });
        }
        return geos;

    } catch (error) {
        // Amélioration du logging d'erreur
        let errorType = "Unknown geolocation error";
        let logMessage = `Error geolocating ${bssid}:`;

        if (error.response) {
            // Erreur HTTP (réponse reçue mais statut != 2xx)
            errorType = `HTTP Error ${error.response.status}`;
            logMessage += ` ${errorType}.`;
            console.error(logMessage);
            // console.error("Response Headers:", error.response.headers); 
             // Essayer de décoder le corps de la réponse d'erreur si c'est du texte
             if (error.response.data && typeof error.response.data.toString === 'function') {
                 try {
                     console.error("Response Body Snippet:", error.response.data.toString('utf-8').substring(0, 200)); // Limiter la sortie
                 } catch (e) {
                     console.error("Could not decode error response body.");
                 }
             }
        } else if (error.request) {
            // Erreur réseau (pas de réponse reçue)
            if (error.code === 'ETIMEDOUT') {
                errorType = "Request Timeout";
            } else if (error.code === 'ENOTFOUND') {
                errorType = "DNS Resolution Failed";
            } else if (error.code === 'ECONNREFUSED'){
                errorType = "Connection Refused";
            } else {
                errorType = `Network Error (${error.code || 'No code'})`;
            }
            logMessage += ` ${errorType}.`;
            console.error(logMessage);
        } else {
            // Erreur de configuration Axios ou autre
             errorType = `Request Setup Error`;
             logMessage += ` ${errorType}: ${error.message}`; // Inclure le message d'erreur original
             console.error(logMessage);
        }

        // Retourner une liste vide en cas d'erreur
        return [];
    }
}

/**
 * @typedef {object} LocationData
 * @property {string} bssid
 * @property {string} paddedBSSID
 * @property {number} lat
 * @property {number} lon
 * @property {number} channel
 * @property {number} hacc
 * @property {number} timestamp - Timestamp de la géolocalisation (Date.now())
 */

/**
 * @typedef {object} MovementData
 * @property {string} paddedBSSID
 * @property {LocationData} oldLocation
 * @property {LocationData} newLocation
 * @property {number} distanceKm - Distance calculée en km
 * @property {number} timeDiffHours - Différence de temps en heures
 */

/**
 * @brief Écrit le fichier KML en utilisant xmlbuilder2, avec styles et lignes pour les mouvements.
 * @param {LocationData[]} currentLocations - Tableau des localisations actuelles.
 * @param {MovementData[]} movements - Tableau des mouvements détectés.
 * @param {string} fname - Nom du fichier KML de sortie.
 * @param {boolean} movementOnly - Si true, n'inclut que les BSSIDs ayant bougé.
 */
function writeKML(currentLocations, movements, fname, movementOnly) {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('kml', { xmlns: 'http://www.opengis.net/kml/2.2' })
        .ele('Document');

    root.ele('name').txt('BSSID Locations & Movements');

    // --- Styles KML ---
    // Style pour les points stables
    root.ele('Style', { id: 'stablePoint' })
        .ele('IconStyle')
            .ele('scale').txt('1.0').up()
            .ele('Icon')
                .ele('href').txt('http://maps.google.com/mapfiles/kml/paddle/ylw-blank.png').up() // Icône jaune
            .up()
        .up();

    // Style pour les anciennes positions des points déplacés
    root.ele('Style', { id: 'oldMovedPoint' })
        .ele('IconStyle')
            .ele('scale').txt('0.8').up()
            .ele('Icon')
                .ele('href').txt('http://maps.google.com/mapfiles/kml/paddle/red-blank.png').up() // Icône rouge pâle
            .up()
            .ele('color').txt('990000ff').up() // Rouge semi-transparent
        .up();

    // Style pour les nouvelles positions des points déplacés
    root.ele('Style', { id: 'newMovedPoint' })
        .ele('IconStyle')
            .ele('scale').txt('1.2').up()
            .ele('Icon')
                .ele('href').txt('http://maps.google.com/mapfiles/kml/paddle/grn-blank.png').up() // Icône verte
            .up()
        .up();

    // Style pour les lignes de mouvement
    root.ele('Style', { id: 'movementLine' })
        .ele('LineStyle')
            .ele('color').txt('ff00aaff').up() // Couleur (Magenta)
            .ele('width').txt('2').up()
        .up();

    // --- Organisation des données ---
    const movedBSSIDs = new Set(movements.map(m => m.paddedBSSID));
    const locationsToDisplay = movementOnly
        ? currentLocations.filter(loc => movedBSSIDs.has(loc.paddedBSSID))
        : currentLocations;

    // --- Ajout des Placemarks ---
    // D'abord les lignes et anciennes positions pour qu'elles soient en dessous
    if (movements.length > 0) {
        const movementFolder = root.ele('Folder').ele('name').txt('Movements').up();
        for (const move of movements) {
             // Si movementOnly est activé, on ne dessine que si le BSSID courant est inclus
             if (movementOnly && !locationsToDisplay.some(loc => loc.paddedBSSID === move.paddedBSSID)) {
                continue;
            }

            // Point Ancien
            const oldPlacemark = movementFolder.ele('Placemark');
            oldPlacemark.ele('name').txt(`${move.paddedBSSID} (Old)`);
            oldPlacemark.ele('styleUrl').txt('#oldMovedPoint');
            oldPlacemark.ele('description').txt(
                `BSSID: ${move.paddedBSSID}\n` +
                `Timestamp: ${new Date(move.oldLocation.timestamp).toISOString()}\n` +
                `Coords: ${move.oldLocation.lat}, ${move.oldLocation.lon}\n` +
                `Moved: ${move.distanceKm.toFixed(3)} km over ${move.timeDiffHours.toFixed(1)} hours`
            );
            oldPlacemark.ele('Point')
                       .ele('coordinates').txt(`${move.oldLocation.lon},${move.oldLocation.lat},0`);

             // Ligne de Mouvement
             const linePlacemark = movementFolder.ele('Placemark');
             linePlacemark.ele('name').txt(`Movement: ${move.paddedBSSID}`);
             linePlacemark.ele('styleUrl').txt('#movementLine');
             linePlacemark.ele('LineString')
                          .ele('coordinates').txt(
                              `${move.oldLocation.lon},${move.oldLocation.lat},0 ` +
                              `${move.newLocation.lon},${move.newLocation.lat},0`
                          );
        }
    }

    // Ensuite les positions actuelles (stables ou nouvelles positions des BSSIDs déplacés)
    const currentFolder = root.ele('Folder').ele('name').txt('Current Locations').up();
    for (const loc of locationsToDisplay) {
        // Ignorer les coordonnées invalides
        if (loc.lat === -180 || loc.lon === -180 || isNaN(loc.lat) || isNaN(loc.lon)) {
            continue;
        }

        const isMoved = movedBSSIDs.has(loc.paddedBSSID);
        const styleUrl = isMoved ? '#newMovedPoint' : '#stablePoint';
        const movementInfo = movements.find(m => m.paddedBSSID === loc.paddedBSSID);

        const placemark = currentFolder.ele('Placemark');
        placemark.ele('name').txt(loc.paddedBSSID);
        placemark.ele('styleUrl').txt(styleUrl);
        let description = `BSSID: ${loc.paddedBSSID}\n` +
                           `Timestamp: ${new Date(loc.timestamp).toISOString()}\n` +
                           `Coords: ${loc.lat}, ${loc.lon}\n` +
                           `Channel: ${loc.channel}\n` +
                           `Hacc: ${loc.hacc}m`;
        if (isMoved && movementInfo) {
            description += `\nMoved: ${movementInfo.distanceKm.toFixed(3)} km from ${movementInfo.oldLocation.lat}, ${movementInfo.oldLocation.lon}`;
        }
        placemark.ele('description').txt(description);
        placemark.ele('Point')
                 .ele('coordinates').txt(`${loc.lon},${loc.lat},0`); // KML utilise lon,lat,altitude
    }

    // Conversion de l'objet XML en chaîne, formatée
    const kmlString = root.end({ prettyPrint: true });

    try {
        fs.writeFileSync(fname, kmlString);
        console.info(`KML data written to ${fname}`);
    } catch (error) {
        console.error(`Error writing KML file ${fname}:`, error.message);
    }
}


/**
 * @brief Lit un fichier de BSSIDs et les retourne dans un Set (pour unicité).
 * @param {string} fname - Le nom du fichier à lire.
 * @returns {Set<string>} - Set de BSSIDs uniques.
 */
function get_bssids_from_file(fname) {
    const bssids = new Set();
    try {
        const content = fs.readFileSync(fname, 'utf-8');
        content.split(/\r?\n/).forEach(line => {
            const trimmedLine = line.trim();
            // Ajout validation format MAC simple
            if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(trimmedLine)) {
                bssids.add(trimmedLine.toLowerCase()); // Stocker en minuscules pour cohérence
            } else if (trimmedLine) {
                 console.warn(`Ignoring invalid BSSID format in file: "${trimmedLine}"`);
            }
        });
    } catch (error) {
        console.error(`Error reading BSSID file ${fname}:`, error.message);
        process.exit(1);
    }
    return bssids;
}

/**
 * @brief Fonction pour obtenir les options de configuration via un menu interactif.
 * @returns {Promise<object>} Un objet contenant les options choisies, similaire à argv.
 */
async function getOptionsInteractively() {
    console.log("\n--- Configuration Interactive ---");

    const answers = {};

    // 1. Type d'entrée
    const { inputType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'inputType',
            message: "Quel type d'entrée souhaitez-vous utiliser ?",
            choices: [
                { name: "Un seul BSSID", value: "bssid" },
                { name: "Un fichier de BSSIDs", value: "infile" },
            ],
        },
    ]);

    // 2. Valeur d'entrée
    if (inputType === 'bssid') {
        const { bssid } = await inquirer.prompt([
            {
                type: 'input',
                name: 'bssid',
                message: "Entrez le BSSID (ex: 00:11:22:aa:bb:cc) :",
                validate: (value) => {
                    if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value)) {
                        return true;
                    }
                    return "Format BSSID invalide. Utilisez HH:HH:HH:HH:HH:HH.";
                },
                filter: (value) => value.toLowerCase(), // Convertir en minuscules
            },
        ]);
        answers.bssid = bssid;
    } else {
        const { infile } = await inquirer.prompt([
            {
                type: 'input',
                name: 'infile',
                message: "Entrez le chemin du fichier d'entrée BSSID :",
                validate: (value) => {
                    if (fs.existsSync(value)) {
                        return true;
                    }
                    return "Fichier non trouvé. Veuillez entrer un chemin valide.";
                },
            },
        ]);
        answers.infile = infile;
    }

    // 3. Options de sortie
    const { outputFormats } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'outputFormats',
            message: "Quels formats de sortie souhaitez-vous générer ?",
            choices: [
                { name: "Fichier KML", value: "kml" },
                { name: "Fichier JSON (recommandé pour --compare)", value: "json" },
                { name: "Fichier TSV", value: "tsv" },
                { name: "Console (stdout)", value: "stdout", checked: true },
            ],
            filter: (values) => { // Assurer stdout si rien d'autre n'est choisi
                 if (values.length === 0) return ['stdout'];
                 if (values.length > 1 && values.includes('stdout') && values.some(v => ['kml', 'json', 'tsv'].includes(v))) {
                     // Ne pas forcer stdout si un fichier est déjà demandé
                     return values.filter(v => v !== 'stdout');
                 }
                 return values;
             },
        },
    ]);

    if (outputFormats.includes('kml')) {
        const { kml } = await inquirer.prompt([{ type: 'input', name: 'kml', message: "Nom du fichier KML de sortie :", default: "output.kml" }]);
        answers.kml = kml;
    }
    if (outputFormats.includes('json')) {
        const { jsonOut } = await inquirer.prompt([{ type: 'input', name: 'jsonOut', message: "Nom du fichier JSON de sortie :", default: "output.json" }]);
        answers.jsonOut = jsonOut;
    }
    // Proposer TSV seulement si JSON n'est pas choisi et si l'option TSV est cochée
    if (outputFormats.includes('tsv') && !answers.jsonOut) {
        const { outfile } = await inquirer.prompt([{ type: 'input', name: 'outfile', message: "Nom du fichier TSV de sortie :", default: "output.tsv" }]);
        answers.outfile = outfile;
    }
    answers.toStdout = outputFormats.includes('stdout') && !answers.kml && !answers.jsonOut && !answers.outfile;


    // 4. Concurrence (si fichier)
    if (answers.infile) {
        const { concurrency } = await inquirer.prompt([{
            type: 'number',
            name: 'concurrency',
            message: "Nombre maximum de requêtes simultanées :",
            default: 5,
            validate: (value) => (value > 0 ? true : "Doit être un nombre positif.")
        }]);
        answers.concurrency = concurrency;
    } else {
        answers.concurrency = 1; // Pas pertinent pour un seul BSSID
    }

    // 5. Comparaison
    const { useCompare } = await inquirer.prompt([{ type: 'confirm', name: 'useCompare', message: "Comparer avec des résultats précédents ?", default: false }]);
    if (useCompare) {
        const { compare } = await inquirer.prompt([{
            type: 'input',
            name: 'compare',
            message: "Chemin du fichier JSON de comparaison :",
            validate: (value) => (fs.existsSync(value) ? true : "Fichier de comparaison non trouvé.")
        }]);
        answers.compare = compare;

        const { movementOnly } = await inquirer.prompt([{ type: 'confirm', name: 'movementOnly', message: "N'afficher/sauvegarder que les BSSIDs ayant bougé ?", default: false }]);
        answers.movementOnly = movementOnly;

        const { minDistance } = await inquirer.prompt([{
            type: 'number',
            name: 'minDistance',
            message: "Distance minimale (mètres) pour considérer un mouvement :",
            default: 10,
            validate: (value) => (value >= 0 ? true : "Doit être positif ou zéro.")
        }]);
        answers.minDistance = minDistance;
    } else {
         answers.compare = undefined;
         answers.movementOnly = false;
         answers.minDistance = 10; // Garder une valeur par défaut
    }

     // 6. Filtre Hacc
     const { maxHacc } = await inquirer.prompt([{
         type: 'number',
         name: 'maxHacc',
         message: "Précision horizontale max acceptable (mètres, -1 pour désactiver) :",
         default: -1,
         validate: (value) => (value >= -1 ? true : "Doit être -1 ou un nombre positif.")
     }]);
     answers.maxHacc = maxHacc;


    console.log("\nConfiguration terminée.");
    return answers;
}

/**
 * Fonction principale d'exécution
 */
async function main() {
    // Afficher l'avertissement éthique
    console.warn(ETHICAL_WARNING);

    const executionTimestamp = Date.now(); // Timestamp global pour cette exécution

    let config; // Variable pour contenir la configuration (interactive ou CLI)

    // Vérifier si le mode interactif est demandé
    const isInteractive = process.argv.includes('-i') || process.argv.includes('--interactive');

    if (isInteractive) {
        // Obtenir la configuration via inquirer
        config = await getOptionsInteractively();
        // Pas besoin de validation yargs ici, elle est faite dans getOptionsInteractively ou implicite
    } else {
        // Obtenir la configuration via yargs (comportement existant)
        config = yargs(hideBin(process.argv))
            .usage('Usage: $0 [options] OR $0 -i')
            .option('b', {
                alias: 'bssid',
                describe: 'Single BSSID to geolocate (e.g., 00:11:22:33:44:55)',
                type: 'string',
            })
            .option('f', {
                alias: 'infile',
                describe: 'File of BSSIDs to geolocate (one per line)',
                type: 'string',
            })
            .option('k', {
                alias: 'kml',
                describe: 'Output KML filename',
                type: 'string',
            })
            .option('o', {
                alias: 'outfile',
                describe: 'Write output to TSV file (ignored if --json-out is used)',
                type: 'string',
            })
            .option('j', {
                 alias: 'json-out',
                 describe: 'Write output to JSON file (overrides --outfile for TSV)',
                 type: 'string',
            })
            .option('c', {
                alias: 'concurrency',
                describe: 'Maximum concurrent requests for file processing',
                type: 'number',
                default: 5
            })
            .option('compare', {
                describe: 'Path to previous JSON results file for movement comparison',
                type: 'string',
            })
            .option('debug', {
                describe: 'Enable verbose debug logs',
                type: 'boolean',
                default: false,
            })
            .option('movement-only', {
                 describe: 'Output only BSSIDs that have moved significantly',
                 type: 'boolean',
                 default: false,
            })
            .option('min-distance', {
                 describe: 'Minimum distance (meters) to consider as movement',
                 type: 'number',
                 default: 10, // 10 mètres par défaut
            })
            .option('max-hacc', {
                 describe: 'Maximum acceptable horizontal accuracy (hacc) in meters to consider a location valid (-1 to disable)',
                 type: 'number',
                 default: -1 // Désactivé par défaut
            })
            // L'option -i est gérée manuellement avant, mais on peut la documenter
             .option('i', {
                 alias: 'interactive',
                 describe: 'Run in interactive configuration mode',
                 type: 'boolean',
             })
            .help('h')
            .alias('h', 'help')
            .conflicts('b', 'f')
            .check((argv) => {
                // Ne pas valider l'entrée si -i est spécifié (même si yargs le voit)
                if (argv.i || argv.interactive) return true;

                if (!argv.bssid && !argv.infile) {
                    throw new Error(`Error: Neither a single BSSID (-b) nor an input file (-f) were provided.`);
                }
                 if (argv.bssid && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(argv.bssid)) {
                     throw new Error(`Error: Invalid BSSID format provided: "${argv.bssid}". Use HH:HH:HH:HH:HH:HH.`);
                 }
                // S'assurer que le fichier de comparaison existe s'il est spécifié
                 if (argv.compare && !fs.existsSync(argv.compare)) {
                     throw new Error(`Error: Comparison file not found: ${argv.compare}`);
                 }
                return true;
            })
            .fail((msg, err, yargs) => {
                console.error(msg || err.message); // Affiche le message d'erreur pertinent
                console.error("\n" + yargs.help());
                process.exit(1);
            })
            .argv;
            DEBUG = !!config.debug;
             // Déterminer si la sortie console est nécessaire (si aucune sortie fichier n'est demandée)
             config.toStdout = !config.kml && !config.jsonOut && !config.outfile;
    }


    // Définir la limite de concurrence
    const limit = pLimit(config.concurrency);

    // Stockage des localisations actuelles (clé = paddedBSSID)
    /** @type {Map<string, LocationData>} */
    let currentLocationsMap = new Map();
    // Stockage des données de comparaison (clé = paddedBSSID)
    /** @type {Map<string, LocationData>} */
    let previousLocationsMap = new Map();
    // Stockage des mouvements détectés
    /** @type {MovementData[]} */
    let movements = [];

    // --- Chargement des données de comparaison ---
    if (config.compare) {
        try {
            console.info(`Loading previous results from ${config.compare}...`);
            const previousDataRaw = fs.readFileSync(config.compare, 'utf-8');
            const previousData = JSON.parse(previousDataRaw);
            if (!previousData.locations || !Array.isArray(previousData.locations)) {
                throw new Error("Invalid JSON format: 'locations' array not found.");
            }
            // Utiliser le timestamp du fichier précédent s'il existe
            const previousTimestamp = previousData.executionTimestamp || null;

            let loadedCount = 0;
            previousData.locations.forEach(loc => {
                 // Assurer la présence des champs nécessaires et la normalisation
                 if (loc.paddedBSSID && loc.lat != null && loc.lon != null) {
                     loadedCount++;
                     previousLocationsMap.set(loc.paddedBSSID.toLowerCase(), {
                         ...loc,
                         timestamp: loc.timestamp || previousTimestamp // Utiliser le timestamp individuel ou global
                     });
                 } else {
                      console.warn(`Skipping incomplete previous location entry: ${JSON.stringify(loc)}`);
                 }
             });
            console.info(`Loaded ${loadedCount} previous location entries.`);

            // Appliquer le filtre --max-hacc aux données précédentes
            if (config.maxHacc >= 0) {
                const originalCount = previousLocationsMap.size;
                previousLocationsMap = new Map(
                    [...previousLocationsMap].filter(([key, loc]) => loc.hacc != null && loc.hacc >= 0 && loc.hacc <= config.maxHacc)
                );
                console.info(`Filtered previous locations by max-hacc=${config.maxHacc}m. Kept ${previousLocationsMap.size}/${originalCount}.`);
            }
        } catch (error) {
            console.error(`Error reading or parsing comparison file ${config.compare}:`, error.message);
            process.exit(1);
        }
    }

    // --- Géolocalisation ---
    if (config.bssid) {
        const locations = await geolocateApple(config.bssid.toLowerCase());
        locations.forEach(loc => {
             // Utiliser paddedBSSID comme clé, stocker l'objet complet
             if (!currentLocationsMap.has(loc.paddedBSSID)) {
                currentLocationsMap.set(loc.paddedBSSID, loc);
            } else {
                 // Gérer les doublons potentiels (garder le plus récent? log?) - Pour l'instant, on garde le premier trouvé.
            }
        });
    }
    else if (config.infile) {
        const bssids = get_bssids_from_file(config.infile); // Récupère les BSSIDs déjà en minuscules
        console.info(`Processing ${bssids.size} BSSIDs from ${config.infile} with concurrency ${config.concurrency}...`);

        const promises = Array.from(bssids).map(bssid => {
            return limit(async () => {
                // geolocateApple retourne maintenant un tableau d'objets LocationData
            const locations = await geolocateApple(bssid);
                return locations;
            });
        });

        const resultsArray = await Promise.all(promises);

        // Aplatir et stocker les résultats
        resultsArray.forEach(locations => {
             locations.forEach(loc => {
                 if (!currentLocationsMap.has(loc.paddedBSSID)) {
                    currentLocationsMap.set(loc.paddedBSSID, loc);
                }
            });
        });
    }

    let uniqueCurrentLocations = Array.from(currentLocationsMap.values());
    const geolocatedCount = uniqueCurrentLocations.length;
    console.info(`Geolocated ${geolocatedCount} unique BSSIDs.`);

    // Appliquer le filtre --max-hacc aux données actuelles
    if (config.maxHacc >= 0) {
        uniqueCurrentLocations = uniqueCurrentLocations.filter(loc => loc.hacc != null && loc.hacc >= 0 && loc.hacc <= config.maxHacc);
        console.info(`Filtered current locations by max-hacc=${config.maxHacc}m. Kept ${uniqueCurrentLocations.length}/${geolocatedCount}.`);
    }

    // Recréer la map à partir des données filtrées pour la comparaison et la sortie
    currentLocationsMap = new Map(uniqueCurrentLocations.map(loc => [loc.paddedBSSID, loc]));
    console.info(`Processing ${currentLocationsMap.size} valid unique BSSIDs after accuracy filtering.`);

    // --- Analyse de Mouvement ---
    if (config.compare) {
        console.info(`Comparing current locations with previous data...`);

        for (const [paddedBSSID, currentLocation] of currentLocationsMap.entries()) {
            const previousLocation = previousLocationsMap.get(paddedBSSID);

            if (previousLocation) {
                 // Ignorer si les coordonnées sont invalides dans l'un ou l'autre
                 // Les points avec lat/lon invalides sont généralement exclus par le filtre hacc != -1 implicite,
                 // mais on garde une vérification de sécurité.
                 if (currentLocation.lat === -180 || currentLocation.lon === -180 || isNaN(currentLocation.lat) || isNaN(currentLocation.lon) ||
                     previousLocation.lat === -180 || previousLocation.lon === -180 || isNaN(previousLocation.lat) || isNaN(previousLocation.lon)) {
                      continue;
                  }

                const distance = calculateDistance(
                    previousLocation.lat, previousLocation.lon,
                    currentLocation.lat, currentLocation.lon
                );
                const distanceM = distance * 1000;

                // Prendre hacc >= 0, sinon 0 (un hacc inconnu n'ajoute pas de marge d'erreur connue)
                const haccOld = previousLocation.hacc != null && previousLocation.hacc >= 0 ? previousLocation.hacc : 0;
                const haccNew = currentLocation.hacc != null && currentLocation.hacc >= 0 ? currentLocation.hacc : 0;

                // Condition de mouvement affinée: distance > somme(hacc) + seuil minimum
                if (distanceM >= (haccOld + haccNew + config.minDistance)) {
                    const timeDiffMs = currentLocation.timestamp - (previousLocation.timestamp || 0); // Gérer timestamp manquant
                    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

                    movements.push({
                        paddedBSSID: paddedBSSID,
                        oldLocation: previousLocation,
                        newLocation: currentLocation,
                        distanceKm: distance, // Garder la distance brute en km pour l'output
                        timeDiffHours: timeDiffHours
                    });
                    // Log amélioré indiquant que le check hacc+minDistance est passé
                    console.log(`Movement detected for ${paddedBSSID}: ${distance.toFixed(3)} km (distance ${distanceM.toFixed(0)}m >= hacc(${haccOld}+${haccNew}) + min_dist(${config.minDistance}) = ${(haccOld + haccNew + config.minDistance).toFixed(0)}m)`);
                }
            }
        }
        console.info(`Detected ${movements.length} BSSIDs that moved >= ${config.minDistance} meters.`);
    }

    // --- Filtrage pour --movement-only ---
    const finalLocationsToOutput = config.movementOnly
        ? Array.from(currentLocationsMap.values()).filter(loc => movements.some(m => m.paddedBSSID === loc.paddedBSSID))
        : Array.from(currentLocationsMap.values());

    const finalMovementsToOutput = config.movementOnly
        ? movements // Si movement-only, on a déjà filtré implicitement
        : movements; // Sinon, on garde tous les mouvements détectés pour le KML etc.

    if (config.movementOnly) {
         console.info(`Filtering output to only include ${finalLocationsToOutput.length} moved BSSIDs.`);
    }


    // --- Sortie des résultats ---
    if (config.kml) {
        writeKML(finalLocationsToOutput, finalMovementsToOutput, config.kml, config.movementOnly);
    }

    if (config.jsonOut) {
        // Écriture dans un fichier JSON
        try {
            const outputData = {
                executionTimestamp: executionTimestamp,
                parameters: { // Inclure les paramètres utilisés (depuis config)
                    infile: config.infile,
                    bssid: config.bssid,
                    compareFile: config.compare,
                    movementOnly: config.movementOnly,
                    minDistanceMeters: config.minDistance,
                    maxHacc: config.maxHacc,
                    concurrency: config.concurrency, // Ajouter la concurrence
                },
                locations: finalLocationsToOutput,
                movementsDetected: finalMovementsToOutput
            };
            fs.writeFileSync(config.jsonOut, JSON.stringify(outputData, null, 2)); // Utiliser config
            console.info(`JSON data written to ${config.jsonOut}`); // Utiliser config
        } catch (error) {
            console.error(`Error writing JSON file ${config.jsonOut}:`, error.message); // Utiliser config
        }
    } else if (config.outfile && !config.jsonOut) { // Sortie TSV seulement si JSON n'est pas demandé // Utiliser config
        // Écriture dans un fichier TSV
        try {
            const tsvLines = finalLocationsToOutput.map(loc => {
                 const moveInfo = movements.find(m => m.paddedBSSID === loc.paddedBSSID);
                 const cols = [
                     loc.paddedBSSID,
                     loc.lat,
                     loc.lon,
                     loc.channel,
                     loc.hacc,
                     new Date(loc.timestamp).toISOString() // Timestamp ISO
                 ];
                 // Ajouter infos de mouvement si dispo
                 if (moveInfo) {
                     cols.push(moveInfo.oldLocation.lat);
                     cols.push(moveInfo.oldLocation.lon);
                     cols.push(new Date(moveInfo.oldLocation.timestamp).toISOString());
                     cols.push(moveInfo.distanceKm.toFixed(5)); // Plus de précision
                     cols.push(moveInfo.timeDiffHours.toFixed(2));
                 } else if (config.compare) { // Ajouter des placeholders si comparaison active mais pas de mouvement
                     cols.push('', '', '', '', '');
                 }
                 return cols.join('\t');
            });
             // Ajouter l'en-tête
             let header = ['BSSID', 'Latitude', 'Longitude', 'Channel', 'Hacc', 'Timestamp'];
             if (config.compare) { // Utiliser config
                 header.push('OldLatitude', 'OldLongitude', 'OldTimestamp', 'DistanceKm', 'TimeDiffHours');
             }
            fs.writeFileSync(config.outfile, header.join('\t') + '\n' + tsvLines.join('\n') + '\n'); // Utiliser config
            console.info(`TSV data written to ${config.outfile}`); // Utiliser config
        } catch (error) {
            console.error(`Error writing TSV file ${config.outfile}:`, error.message); // Utiliser config
        }
    } else if (config.toStdout) { // Utiliser config.toStdout déterminé plus tôt
        // Sortie par défaut sur la console (stdout)
         console.log("\n--- Geolocated BSSIDs ---");
         let header = ['BSSID'.padEnd(17), 'Latitude'.padEnd(12), 'Longitude'.padEnd(13), 'Ch', 'Hacc', 'Timestamp'];
         if (config.compare) { // Utiliser config
             header.push('OldLat'.padEnd(12), 'OldLon'.padEnd(13), 'DistanceKm', 'TimeDiffHrs');
         }
         console.log(header.join(' '));

        finalLocationsToOutput.forEach(loc => {
             const moveInfo = movements.find(m => m.paddedBSSID === loc.paddedBSSID);
            const cols = [
                loc.paddedBSSID.padEnd(17),
                loc.lat.toFixed(8).padEnd(12),
                loc.lon.toFixed(8).padEnd(13),
                String(loc.channel).padEnd(3),
                String(loc.hacc).padEnd(4),
                 new Date(loc.timestamp).toLocaleTimeString() // Heure locale simple pour console
            ];
             if (moveInfo) {
                 cols.push(
                     moveInfo.oldLocation.lat.toFixed(8).padEnd(12),
                     moveInfo.oldLocation.lon.toFixed(8).padEnd(13),
                     moveInfo.distanceKm.toFixed(3).padEnd(10),
                     moveInfo.timeDiffHours.toFixed(1).padEnd(11)
                 );
             } else if (config.compare) { // Utiliser config
                 cols.push(''.padEnd(12), ''.padEnd(13), ''.padEnd(10), ''.padEnd(11));
             }
            console.log(cols.join(' '));
        });
    }
}

// --- Point d'entrée : exécution de la fonction main ---
main().catch(error => {
    console.error("\nAn unexpected error occurred in main execution:", error.message);
    // Si l'erreur a une pile, l'afficher pour le débogage
    if (error.stack) {
         console.error(error.stack);
    }
    process.exit(1); // Termine avec un code d'erreur
});