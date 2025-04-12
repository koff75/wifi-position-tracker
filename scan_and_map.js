#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises; // Utiliser la version promise de fs
const path = require('path');
const { create } = require('xmlbuilder2'); // Réutiliser pour KML
const iconv = require('iconv-lite'); // Ajout d'iconv-lite

const execPromise = promisify(exec);

const BSSID_GEOLOCATOR_SCRIPT = path.join(__dirname, 'bssid-geolocator.js');
const OUTPUT_KML_FILE = 'scanned_wifi_map.kml';

/**
 * Exécute la commande netsh pour scanner les réseaux Wi-Fi.
 * @returns {Promise<string>} La sortie standard de la commande netsh.
 */
async function getNetshOutput() {
    console.log('Scanning for Wi-Fi networks using netsh...');
    try {
        // Exécuter SANS spécifier d'encodage pour obtenir le buffer brut
        const command = 'netsh wlan show networks mode=bssid';
        // Augmenter la taille max du buffer au cas où la sortie soit très longue
        const { stdout, stderr } = await execPromise(command, { encoding: 'buffer', maxBuffer: 10 * 1024 * 1024 });

        if (stderr && stderr.length > 0) {
            // Essayer de décoder stderr aussi avec iconv
            let stderrStr = iconv.decode(stderr, 'cp850'); // Essayer cp850
            try {
                 stderrStr = iconv.decode(stderr, 'cp437'); // Essayer cp437
            } catch(e){}
             try {
                 // Tenter utf8 en dernier recours pour stderr
                 if (!stderrStr) stderrStr = stderr.toString('utf8');
            } catch(e){}
            console.warn(`Netsh command produced stderr: ${stderrStr || '[Could not decode stderr]'}`);
        }

        if (!stdout || stdout.length === 0) {
             throw new Error('Netsh command returned no output.');
        }

        // Essayer de décoder avec les codepages Windows courants via iconv-lite
        // cp850 est fréquent en Europe de l'Ouest
        let outputString = iconv.decode(stdout, 'cp850');

        // Heuristique simple pour vérifier si le décodage semble correct
        // Si des mots clés français sont toujours incorrects -> essayer cp437
        if (!outputString.includes('réseaux') || !outputString.includes('SSID 1 :')) { // Recherche du format exact vu dans les logs
            console.log("cp850 decoding might be incorrect, trying cp437...");
            outputString = iconv.decode(stdout, 'cp437');
        }

        // Tenter UTF8 en dernier recours si les autres échouent visiblement
        if (!outputString.includes('réseaux') || !outputString.includes('SSID 1 :')){
             console.log("cp437 decoding also seems incorrect, trying utf8 as last resort...");
             try {
                  outputString = stdout.toString('utf8');
             } catch (utfError) {
                  console.error("Failed to decode netsh output even with UTF8.");
                  throw utfError;
             }
        }

        console.log('Scan complete.');
        return outputString;

    } catch (error) {
        console.error(`Error executing netsh command: ${error.message}`);
        // Ne pas tenter de décoder ici car l'erreur peut être autre chose
        throw error; // Relancer l'erreur
    }
}

/**
 * Parse la sortie de la commande netsh pour extraire les paires SSID/BSSID.
 * @param {string} netshOutput - La sortie brute de netsh.
 * @returns {Array<{ssid: string, bssid: string}>} Un tableau d'objets contenant les SSID et BSSID.
 */
function parseNetshOutput(netshOutput) {
    console.log('Parsing netsh output...');
    const lines = netshOutput.split(/\r?\n/);
    const networks = [];
    let currentSsid = null;
    // Regex encore plus robustes v3 : Chercher Num, ignorer tout jusqu'au premier :, capturer après
    const ssidRegex = /^\s*SSID\s+\d+.*?:\s*(.*)$/i; // Utilisation de .*?: (non gourmand)
    const bssidRegex = /^\s*BSSID\s+\d+.*?:\s*([0-9a-f]{2}(:[0-9a-f]{2}){5})/i; // Utilisation de .*?: (non gourmand)

    console.log('--- Start Detailed Parsing Log ---');
    for (const line of lines) {
        // Log de la ligne actuelle (avec trim pour voir les espaces invisibles)
        console.log(`[LINE]: "${line}" (Trimmed: "${line.trim()}")`);

        const ssidMatch = line.match(ssidRegex);
        const bssidMatch = line.match(bssidRegex);

        // Log des résultats des regex
        console.log(`  [SSID Regex Match]: ${ssidMatch ? JSON.stringify(ssidMatch) : 'null'}`);
        console.log(`  [BSSID Regex Match]: ${bssidMatch ? JSON.stringify(bssidMatch) : 'null'}`);

        if (ssidMatch) {
            currentSsid = ssidMatch[1].trim();
            // Gérer les SSID vides ou potentiellement étranges
             if (!currentSsid) {
                 currentSsid = '(Hidden Network)';
             }
        } else if (bssidMatch && currentSsid !== null) {
            // Associer ce BSSID au dernier SSID trouvé
            networks.push({
                ssid: currentSsid,
                bssid: bssidMatch[1].toLowerCase() // Stocker en minuscules pour cohérence
            });
        } else if (!line.trim() || line.includes('interface') || line.includes('réseaux sont visibles')) { // Adapté FR
             // Réinitialiser currentSsid sur les lignes vides ou les en-têtes pour éviter
             // d'associer des BSSID à un SSID incorrect si le format change.
             // currentSsid = null; // Gardons commenté pour l'instant
        }
    }
    console.log('--- End Detailed Parsing Log ---');
    console.log(`Found ${networks.length} BSSID(s).`);
    return networks;
}

/**
 * Appelle bssid-geolocator.js pour un BSSID et extrait les coordonnées correspondantes.
 * @param {string} bssid - Le BSSID à géolocaliser.
 * @returns {Promise<{lat: number, lon: number} | null>} Les coordonnées ou null si non trouvées/erreur.
 */
async function geolocateSingleBssid(bssid) {
    console.log(`  Geolocating ${bssid}...`);
    try {
        // Exécute SANS sortie fichier, capture la sortie console
        const command = `node "${BSSID_GEOLOCATOR_SCRIPT}" -b ${bssid}`;
        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            // Afficher les erreurs de bssid-geolocator mais ne pas bloquer
            console.warn(`    Warning during geolocation of ${bssid}: ${stderr.trim()}`);
        }

        const outputLines = stdout.trim().split(/\r?\n/);
        const headerLine = 'BSSID'.padEnd(17); // Repère pour ignorer l'en-tête potentiel

        for (const line of outputLines) {
             if (line.startsWith(headerLine) || !line.trim()) continue; // Ignorer en-tête et lignes vides

            const parts = line.trim().split(/\s+/); // Diviser par un ou plusieurs espaces

            // Le format de sortie console est: BSSID Lat Lon Ch Hacc Timestamp [OldLat OldLon ...]
            // parts[0] est le paddedBSSID
            // parts[1] est Latitude
            // parts[2] est Longitude
            if (parts.length >= 3 && parts[0].toLowerCase() === bssid) {
                 const lat = parseFloat(parts[1]);
                 const lon = parseFloat(parts[2]);

                 if (!isNaN(lat) && !isNaN(lon) && lat !== -180 && lon !== -180) {
                     console.log(`    Found location for ${bssid}: ${lat}, ${lon}`);
                     return { lat, lon };
                 } else {
                      console.log(`    Discarding invalid location for ${bssid} from output: ${lat}, ${lon}`);
                      return null; // Ignorer les coordonnées invalides
                 }
            }
        }

        console.log(`    Exact BSSID ${bssid} not found in bssid-geolocator output.`);
        return null; // BSSID spécifique non trouvé dans la sortie (peut arriver si filtré par hacc etc.)

    } catch (error) {
        console.error(`    Error running bssid-geolocator for ${bssid}: ${error.message}`);
        return null;
    }
}

/**
 * Génère un fichier KML à partir des données de localisation.
 * @param {Array<{ssid: string, bssid: string, lat: number, lon: number}>} locationsData
 */
async function generateKml(locationsData) {
    console.log(`\nGenerating KML file: ${OUTPUT_KML_FILE}...`);
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('kml', { xmlns: 'http://www.opengis.net/kml/2.2' })
        .ele('Document');

    root.ele('name').txt('Scanned Wi-Fi Networks Locations');
    root.ele('description').txt(`Locations of Wi-Fi networks scanned via netsh and geolocated via Apple's WPS API.`);

    let validPoints = 0;
    for (const loc of locationsData) {
        // Vérifier à nouveau la validité, bien que geolocateSingleBssid devrait déjà filtrer
        if (loc.lat == null || loc.lon == null || isNaN(loc.lat) || isNaN(loc.lon) || loc.lat === -180 || loc.lon === -180) {
            continue;
        }
        validPoints++;
        const placemark = root.ele('Placemark');
        placemark.ele('name').txt(loc.ssid || '(No SSID)'); // Afficher le nom du réseau
        placemark.ele('description').txt(
            `SSID: ${loc.ssid || '(No SSID)'}\n` +
            `BSSID: ${loc.bssid}\n` +
            `Coords: ${loc.lat}, ${loc.lon}`
        );
        placemark.ele('Point')
                 .ele('coordinates').txt(`${loc.lon},${loc.lat},0`); // KML: lon,lat,altitude
    }

    if (validPoints === 0) {
         console.warn("No valid locations found to write to KML.");
         return;
    }

    const kmlString = root.end({ prettyPrint: true });

    try {
        await fs.writeFile(OUTPUT_KML_FILE, kmlString);
        console.log(`Successfully wrote ${validPoints} locations to ${OUTPUT_KML_FILE}`);
        console.log(`You can try importing this file into Google Maps (My Maps) or opening it with Google Earth.`);
    } catch (error) {
        console.error(`Error writing KML file ${OUTPUT_KML_FILE}:`, error.message);
    }
}

/**
 * Fonction principale du workflow.
 */
async function runWorkflow() {
    let netshOutput;
    try {
        netshOutput = await getNetshOutput();
    } catch (error) {
        console.error("Failed to get Wi-Fi networks from netsh. Cannot proceed.");
        process.exit(1);
    }

    const networks = parseNetshOutput(netshOutput);
    if (networks.length === 0) {
        console.log("No Wi-Fi networks found by netsh.");
        return;
    }

    const geolocatedNetworks = [];
    console.log("\nStarting geolocation process...");

    // Traiter séquentiellement pour éviter de surcharger bssid-geolocator (qui a sa propre concurrence)
    // et pour un logging plus clair. On pourrait paralléliser ici aussi avec p-limit si besoin.
    for (const network of networks) {
        const location = await geolocateSingleBssid(network.bssid);
        if (location) {
            geolocatedNetworks.push({
                ...network, // ssid, bssid
                ...location // lat, lon
            });
        }
        // Petite pause pour ne pas spammer trop vite (optionnel)
        // await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`\nSuccessfully geolocated ${geolocatedNetworks.length} out of ${networks.length} scanned BSSIDs.`);

    if (geolocatedNetworks.length > 0) {
        await generateKml(geolocatedNetworks);
    } else {
        console.log("No networks were successfully geolocated.");
    }
}

// --- Exécution du Workflow ---
runWorkflow().catch(error => {
    console.error("\nAn unexpected error occurred during the workflow:", error);
    process.exit(1);
});
