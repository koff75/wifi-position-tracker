#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises; // Utiliser la version promise de fs
const path = require('path');
const { create } = require('xmlbuilder2'); // Réutiliser pour KML
const iconv = require('iconv-lite'); // Ajout d'iconv-lite

// Couleurs pour améliorer la lisibilité
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
};

// Fonction pour coloriser le texte
function colorize(text, color) {
    return `${color}${text}${colors.reset}`;
}

// Fonction pour analyser la sécurité WiFi
function analyzeWiFiSecurity(authType, encryption) {
    if (!authType || !encryption) {
        return { level: 'UNKNOWN', color: colors.dim, description: 'Informations manquantes' };
    }
    
    const auth = authType.toLowerCase();
    const enc = encryption.toLowerCase();
    
    if (auth.includes('ouvert') || auth.includes('open') || enc.includes('aucun')) {
        return { level: 'CRITIQUE', color: colors.bgRed, description: 'Réseau ouvert - Aucune sécurité' };
    } else if (auth.includes('wep')) {
        return { level: 'FAIBLE', color: colors.red, description: 'WEP - Sécurité obsolète' };
    } else if (auth.includes('wpa3')) {
        return { level: 'EXCELLENT', color: colors.green, description: 'WPA3 - Sécurité moderne' };
    } else if (auth.includes('wpa2')) {
        if (enc.includes('ccmp') || enc.includes('aes')) {
            return { level: 'BON', color: colors.green, description: 'WPA2-AES - Sécurité correcte' };
        } else {
            return { level: 'MOYEN', color: colors.yellow, description: 'WPA2-TKIP - Sécurité acceptable' };
        }
    } else if (auth.includes('wpa')) {
        return { level: 'MOYEN', color: colors.yellow, description: 'WPA - Sécurité acceptable' };
    } else {
        return { level: 'UNKNOWN', color: colors.dim, description: 'Type de sécurité inconnu' };
    }
}

const execPromise = promisify(exec);

const BSSID_GEOLOCATOR_SCRIPT = path.join(__dirname, 'bssid-geolocator.js');
const OUTPUT_KML_FILE = 'scanned_wifi_map.kml';

/**
 * Exécute la commande netsh pour scanner les réseaux Wi-Fi.
 * @returns {Promise<string>} La sortie standard de la commande netsh.
 */
async function getNetshOutput() {
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
            if (process.argv.includes('--debug')) {
                console.log("cp850 decoding might be incorrect, trying cp437...");
            }
            outputString = iconv.decode(stdout, 'cp437');
        }

        // Tenter UTF8 en dernier recours si les autres échouent visiblement
        if (!outputString.includes('réseaux') || !outputString.includes('SSID 1 :')){
             if (process.argv.includes('--debug')) {
                 console.log("cp437 decoding also seems incorrect, trying utf8 as last resort...");
             }
             try {
                  outputString = stdout.toString('utf8');
             } catch (utfError) {
                  console.error("Failed to decode netsh output even with UTF8.");
                  throw utfError;
             }
        }

        return outputString;

    } catch (error) {
        console.error(`Error executing netsh command: ${error.message}`);
        // Ne pas tenter de décoder ici car l'erreur peut être autre chose
        throw error; // Relancer l'erreur
    }
}

/**
 * Parse la sortie de la commande netsh pour extraire les informations complètes des réseaux.
 * @param {string} netshOutput - La sortie brute de netsh.
 * @returns {Array<{ssid: string, bssid: string, authType: string, encryption: string, signal: string, channel: string, frequency: string}>} Un tableau d'objets contenant les informations des réseaux.
 */
function parseNetshOutput(netshOutput) {
    console.log(colorize('\n🔍 Analyse des réseaux WiFi détectés...', colors.cyan));
    const lines = netshOutput.split(/\r?\n/);
    const networks = [];
    let currentNetwork = null;
    
    // Regex pour capturer toutes les informations
    const ssidRegex = /^\s*SSID\s+\d+.*?:\s*(.*)$/i;
    const bssidRegex = /^\s*BSSID\s+\d+.*?:\s*([0-9a-f]{2}(:[0-9a-f]{2}){5})/i;
    const authRegex = /^\s*Authentification\s*:\s*(.*)$/i;
    const encryptionRegex = /^\s*Chiffrement\s*:\s*(.*)$/i;
    const signalRegex = /^\s*Signal\s*:\s*(\d+%)/i;
    const channelRegex = /^\s*Canal\s*:\s*(\d+)/i;
    const frequencyRegex = /^\s*Bande\s*:\s*(.*)$/i;

    let debugMode = process.argv.includes('--debug'); // Mode debug optionnel
    
    if (debugMode) {
        console.log(colorize('--- Mode Debug Activé ---', colors.dim));
    }
    
    for (const line of lines) {
        if (debugMode) {
            console.log(`[LINE]: "${line}" (Trimmed: "${line.trim()}")`);
        }

        const ssidMatch = line.match(ssidRegex);
        const bssidMatch = line.match(bssidRegex);
        const authMatch = line.match(authRegex);
        const encryptionMatch = line.match(encryptionRegex);
        const signalMatch = line.match(signalRegex);
        const channelMatch = line.match(channelRegex);
        const frequencyMatch = line.match(frequencyRegex);

        if (ssidMatch) {
            // Nouveau réseau détecté
            if (currentNetwork && currentNetwork.bssid) {
                networks.push(currentNetwork);
            }
            currentNetwork = {
                ssid: ssidMatch[1].trim() || '(Réseau masqué)',
                bssid: null,
                authType: null,
                encryption: null,
                signal: null,
                channel: null,
                frequency: null
            };
        } else if (bssidMatch && currentNetwork) {
            currentNetwork.bssid = bssidMatch[1].toLowerCase();
        } else if (authMatch && currentNetwork) {
            currentNetwork.authType = authMatch[1].trim();
        } else if (encryptionMatch && currentNetwork) {
            currentNetwork.encryption = encryptionMatch[1].trim();
        } else if (signalMatch && currentNetwork) {
            currentNetwork.signal = signalMatch[1];
        } else if (channelMatch && currentNetwork) {
            currentNetwork.channel = channelMatch[1];
        } else if (frequencyMatch && currentNetwork) {
            currentNetwork.frequency = frequencyMatch[1].trim();
        }
    }
    
    // Ajouter le dernier réseau s'il existe
    if (currentNetwork && currentNetwork.bssid) {
        networks.push(currentNetwork);
    }
    
    if (debugMode) {
        console.log(colorize('--- Fin Mode Debug ---', colors.dim));
    }
    
    console.log(colorize(`✅ ${networks.length} réseau(x) WiFi détecté(s)`, colors.green));
    return networks;
}

/**
 * Simule le comportement d'un iPhone : géolocalise en utilisant TOUS les BSSIDs visibles
 * @param {Array} networks - Tous les réseaux détectés
 * @returns {Promise<{lat: number, lon: number, totalResults: number} | null>} Coordonnées basées sur la triangulation multi-BSSID
 */
async function geolocateMultipleBSSIDs(networks) {
    if (networks.length === 0) return null;
    
    console.log(colorize('\n📱 SIMULATION iPhone : Géolocalisation multi-BSSID', colors.magenta));
    console.log(colorize('   (Comme le fait votre iPhone pour se localiser)', colors.dim));
    
    // Prendre le premier BSSID et voir combien de résultats Apple renvoie
    const primaryBSSID = networks[0].bssid;
    
    try {
        const command = `node "${BSSID_GEOLOCATOR_SCRIPT}" -b ${primaryBSSID}`;
        const { stdout } = await execPromise(command);
        
        // Compter le nombre de résultats (lignes avec des coordonnées valides)
        const outputLines = stdout.trim().split(/\r?\n/);
        let validResults = 0;
        let mainLocation = null;
        
        for (const line of outputLines) {
            if (line.includes('Geolocated') && line.includes('unique BSSIDs')) {
                const match = line.match(/Geolocated (\d+) unique BSSIDs/);
                if (match) {
                    validResults = parseInt(match[1]);
                }
            }
            
            // Chercher la ligne avec notre BSSID principal
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 3 && parts[0] === primaryBSSID) {
                const lat = parseFloat(parts[1]);
                const lon = parseFloat(parts[2]);
                if (!isNaN(lat) && !isNaN(lon) && lat !== -180 && lon !== -180) {
                    mainLocation = { lat, lon };
                }
            }
        }
        
        if (mainLocation && validResults > 1) {
            console.log(colorize(`   🎯 Triangulation réussie avec ${validResults} points d'accès`, colors.green));
            console.log(colorize(`   📍 Position estimée: ${mainLocation.lat}, ${mainLocation.lon}`, colors.cyan));
            return { ...mainLocation, totalResults: validResults };
        } else if (mainLocation) {
            console.log(colorize(`   📍 Position basée sur 1 point d'accès: ${mainLocation.lat}, ${mainLocation.lon}`, colors.yellow));
            return { ...mainLocation, totalResults: 1 };
        } else {
            console.log(colorize('   ❌ Aucune géolocalisation disponible', colors.red));
            return null;
        }
        
    } catch (error) {
        console.log(colorize('   ❌ Erreur lors de la géolocalisation multi-BSSID', colors.red));
        return null;
    }
}

/**
 * Appelle bssid-geolocator.js pour un BSSID et extrait les coordonnées correspondantes.
 * @param {string} bssid - Le BSSID à géolocaliser.
 * @returns {Promise<{lat: number, lon: number} | null>} Les coordonnées ou null si non trouvées/erreur.
 */
async function geolocateSingleBssid(bssid) {
    process.stdout.write(colorize(`  📍 Géolocalisation ${bssid}...`, colors.blue));
    try {
        // Exécute SANS sortie fichier, capture la sortie console
        const command = `node "${BSSID_GEOLOCATOR_SCRIPT}" -b ${bssid}`;
        const { stdout, stderr } = await execPromise(command);

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
                     console.log(colorize(' ✅ Localisé', colors.green));
                     return { lat, lon };
                 } else {
                     console.log(colorize(' ❌ Données invalides', colors.red));
                     return null; // Ignorer les coordonnées invalides
                 }
            }
        }

        console.log(colorize(' ❌ Non trouvé', colors.red));
        return null; // BSSID spécifique non trouvé dans la sortie

    } catch (error) {
        console.log(colorize(' ❌ Erreur', colors.red));
        return null;
    }
}

/**
 * Affiche un tableau récapitulatif coloré avec audit de sécurité
 * @param {Array} networks - Les réseaux avec leurs informations
 * @param {Array} geolocatedNetworks - Les réseaux géolocalisés
 */
function displayNetworkSummary(networks, geolocatedNetworks) {
    console.log(colorize('\n🏠 RÉSEAUX WiFi DÉTECTÉS - AUDIT DE SÉCURITÉ', colors.bright + colors.cyan));
    console.log('═'.repeat(110));
    
    // En-tête du tableau avec largeurs fixes
    const header = `${colorize('SSID', colors.bright).padEnd(25)} ${colorize('BSSID', colors.bright).padEnd(20)} ${colorize('SÉCURITÉ', colors.bright).padEnd(15)} ${colorize('SIGNAL', colors.bright).padEnd(8)} ${colorize('CANAL', colors.bright).padEnd(7)} ${colorize('GÉOLOC', colors.bright)}`;
    console.log(header);
    console.log('─'.repeat(110));
    
    networks.forEach((network, index) => {
        const security = analyzeWiFiSecurity(network.authType, network.encryption);
        const isGeolocated = geolocatedNetworks.some(g => g.bssid === network.bssid);
        
        // Formatage des colonnes avec largeurs exactes
        const ssid = (network.ssid || '(Inconnu)').substring(0, 23).padEnd(23);
        const bssid = (network.bssid || 'N/A').padEnd(17);
        const securityLevel = security.level.padEnd(10);
        const securityText = colorize(securityLevel, security.color);
        const signalValue = network.signal || 'N/A';
        const signal = network.signal ? 
            colorize(signalValue.padEnd(6), network.signal.replace('%', '') > 70 ? colors.green : network.signal.replace('%', '') > 40 ? colors.yellow : colors.red) : 
            colorize('N/A'.padEnd(6), colors.dim);
        const channel = (network.channel || 'N/A').padEnd(5);
        const geoloc = isGeolocated ? 
            colorize('✅ OUI', colors.green) : 
            colorize('❌ NON', colors.red);
        
        console.log(`${ssid} ${bssid} ${securityText} ${signal} ${channel} ${geoloc}`);
        
        // Détails de sécurité si problématique
        if (security.level === 'CRITIQUE' || security.level === 'FAIBLE') {
            console.log(`   ${colorize('⚠️  ' + security.description, security.color)}`);
        }
    });
    
    console.log('─'.repeat(110));
    
    // Statistiques de sécurité
    const securityStats = {
        'CRITIQUE': networks.filter(n => analyzeWiFiSecurity(n.authType, n.encryption).level === 'CRITIQUE').length,
        'FAIBLE': networks.filter(n => analyzeWiFiSecurity(n.authType, n.encryption).level === 'FAIBLE').length,
        'MOYEN': networks.filter(n => analyzeWiFiSecurity(n.authType, n.encryption).level === 'MOYEN').length,
        'BON': networks.filter(n => analyzeWiFiSecurity(n.authType, n.encryption).level === 'BON').length,
        'EXCELLENT': networks.filter(n => analyzeWiFiSecurity(n.authType, n.encryption).level === 'EXCELLENT').length
    };
    
    console.log(colorize('\n📊 STATISTIQUES DE SÉCURITÉ', colors.bright + colors.yellow));
    console.log('─'.repeat(60));
    
    Object.entries(securityStats).forEach(([level, count]) => {
        if (count > 0) {
            const color = level === 'CRITIQUE' ? colors.bgRed : 
                         level === 'FAIBLE' ? colors.red :
                         level === 'MOYEN' ? colors.yellow :
                         level === 'BON' ? colors.green :
                         colors.green;
            console.log(`${colorize(level.padEnd(12), color)} ${colorize(count + ' réseau(x)', colors.white)}`);
        }
    });
    
    // Recommandations de sécurité
    if (securityStats.CRITIQUE > 0) {
        console.log(colorize('\n🚨 ALERTE SÉCURITÉ:', colors.bgRed + colors.white));
        console.log(colorize('   Des réseaux ouverts ont été détectés ! Évitez de vous y connecter.', colors.red));
    }
    
    if (securityStats.FAIBLE > 0) {
        console.log(colorize('\n⚠️  ATTENTION:', colors.yellow));
        console.log(colorize('   Des réseaux utilisent WEP (obsolète). Recommandé: migration vers WPA2/WPA3.', colors.yellow));
    }
    
    console.log(colorize('\n📍 GÉOLOCALISATION:', colors.cyan));
    console.log(`   ${geolocatedNetworks.length}/${networks.length} réseaux localisés avec succès`);
    
    console.log('═'.repeat(120));
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
    // Banner de démarrage
    console.log(colorize('\n🚀 WIFI POSITION TRACKER - SCANNER & AUDIT', colors.bright + colors.magenta));
    console.log(colorize('═'.repeat(60), colors.magenta));
    console.log(colorize('Scan des réseaux WiFi et audit de sécurité en cours...', colors.cyan));
    
    let netshOutput;
    try {
        console.log(colorize('\n📡 Scan des réseaux WiFi...', colors.blue));
        netshOutput = await getNetshOutput();
    } catch (error) {
        console.error(colorize("❌ Échec du scan des réseaux WiFi. Impossible de continuer.", colors.red));
        process.exit(1);
    }

    const networks = parseNetshOutput(netshOutput);
    if (networks.length === 0) {
        console.log(colorize("❌ Aucun réseau WiFi détecté par netsh.", colors.yellow));
        return;
    }

    const geolocatedNetworks = [];
    console.log(colorize("\n🌍 Géolocalisation des réseaux...", colors.blue));

    // Traiter séquentiellement pour éviter de surcharger bssid-geolocator
    for (const network of networks) {
        const location = await geolocateSingleBssid(network.bssid);
        if (location) {
            geolocatedNetworks.push({
                ...network, // ssid, bssid, authType, encryption, signal, channel, frequency
                ...location // lat, lon
            });
        }
        // Petite pause pour ne pas spammer trop vite
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Simulation du comportement iPhone
    const iphoneLocation = await geolocateMultipleBSSIDs(networks);
    
    // Affichage du tableau récapitulatif avec audit de sécurité
    displayNetworkSummary(networks, geolocatedNetworks);
    
    // Affichage de la comparaison iPhone vs scan individuel
    if (iphoneLocation) {
        console.log(colorize('\n📱 COMPARAISON : Comment votre iPhone se géolocalise', colors.bright + colors.magenta));
        console.log('═'.repeat(80));
        console.log(colorize(`🎯 Méthode iPhone (triangulation) : ${iphoneLocation.totalResults} points d'accès utilisés`, colors.green));
        console.log(colorize(`📍 Position estimée : ${iphoneLocation.lat}, ${iphoneLocation.lon}`, colors.cyan));
        console.log(colorize(`📊 Vs scan individuel : ${geolocatedNetworks.length} réseau(x) géolocalisé(s)`, colors.yellow));
        
        if (iphoneLocation.totalResults > 50) {
            console.log(colorize('\n🏙️  ENVIRONNEMENT URBAIN DÉTECTÉ !', colors.bright + colors.green));
            console.log(colorize(`   Apple utilise ${iphoneLocation.totalResults} points d'accès pour une précision maximale`, colors.green));
        } else if (iphoneLocation.totalResults > 10) {
            console.log(colorize('\n🏘️  ENVIRONNEMENT RÉSIDENTIEL', colors.yellow));
            console.log(colorize(`   Apple utilise ${iphoneLocation.totalResults} points d'accès pour la géolocalisation`, colors.yellow));
        } else {
            console.log(colorize('\n🏞️  ENVIRONNEMENT ISOLÉ', colors.blue));
            console.log(colorize(`   Apple utilise seulement ${iphoneLocation.totalResults} point(s) d'accès disponible(s)`, colors.blue));
        }
        console.log('═'.repeat(80));
    }

    // Génération du fichier KML
    if (geolocatedNetworks.length > 0) {
        console.log(colorize('\n📄 Génération du fichier KML...', colors.blue));
        await generateKml(geolocatedNetworks);
        console.log(colorize(`✅ Fichier KML généré: ${OUTPUT_KML_FILE}`, colors.green));
        console.log(colorize('   Vous pouvez l\'importer dans Google Maps (My Maps) ou Google Earth.', colors.dim));
    } else {
        console.log(colorize("\n❌ Aucun réseau n'a pu être géolocalisé.", colors.yellow));
    }
    
    console.log(colorize('\n🎉 Analyse terminée !', colors.bright + colors.green));
}

// --- Exécution du Workflow ---
runWorkflow().catch(error => {
    console.error("\nAn unexpected error occurred during the workflow:", error);
    process.exit(1);
});
