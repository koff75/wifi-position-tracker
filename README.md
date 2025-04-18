# BSSID Geolocator Node

A Node.js toolkit for geolocating WiFi networks (BSSIDs) using Apple's undocumented location services API. This project contains two main tools:

1. **bssid-geolocator.js**: Core tool for geolocating individual BSSIDs or lists of BSSIDs
2. **scan_and_map.js**: Utility to scan for nearby WiFi networks and map them (Windows only)

## 📋 Table of Contents


- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Interactive Mode Guide](#-interactive-mode-guide)
- [Output Formats](#output-formats)
- [Ethical Considerations](#ethical-considerations)
- [How It Works](#how-it-works)
- [Technical Details](#technical-details)
- [Dependencies](#dependencies)
- [Limitations](#limitations)
- [Legal Disclaimer](#️-legal-disclaimer)

## 🚀 Interactive Mode Guide

The interactive mode makes using this tool simple and intuitive, even for first-time users!

```
$ node bssid-geolocator.js -i

--- Interactive Configuration ---

? What type of input would you like to use? Single BSSID
? Enter the BSSID (ex: 00:11:22:aa:bb:cc): 00:11:22:33:44:55
? Which output formats would you like to generate? Console (stdout), KML file
? Name of KML output file: wifi_location.kml
? Maximum acceptable horizontal accuracy (meters, -1 to disable): 100

Configuration complete.

---------------------------------------------------------------------
Use this tool responsibly and only for
legitimate and authorized research purposes.
---------------------------------------------------------------------

Geolocating bssid 00:11:22:33:44:55...
Successfully geolocated 1 unique BSSIDs.

--- Geolocated BSSIDs ---
BSSID             Latitude      Longitude      Ch  Hacc Timestamp
00:11:22:33:44:55 37.33182490  -122.03118133  1   65   10:42:26 AM

KML data written to wifi_location.kml
```

### 🗺️ Visual Output Example

When you generate a KML file, you can open it in Google Earth or Google Maps to visualize the WiFi access point locations:

```
   ╭─────────────────────────────────────────╮
   │           Google Maps View              │
   │                                         │
   │     ╭───────────────────────────────╮   │
   │     │                               │   │
   │     │                               │   │
   │     │                               │   │
   │     │            📍                 │   │
   │     │         00:11:22:33:44:55     │   │
   │     │                               │   │
   │     │                               │   │
   │     ╰───────────────────────────────╯   │
   │                                         │
   │         📋 KML File Imported            │
   ╰─────────────────────────────────────────╯
```

### 💻 Workflow Simplicity

1. **Run in interactive mode** (`-i` flag)
2. **Follow the prompts** — no need to remember complex parameters
3. **Get instant results** in your preferred format
4. **Visualize the data** using KML output

### 🔄 Movement Comparison Made Easy

The interactive mode also simplifies comparing WiFi locations over time:

```
$ node bssid-geolocator.js -i

? What type of input would you like to use? File of BSSIDs
? Enter the path to the BSSID input file: bssids.txt
? Which output formats would you like to generate? JSON file, KML file
? Name of KML output file: new_locations.kml
? Name of JSON output file: new_locations.json
? Compare with previous results? Yes
? Path to the comparison JSON file: old_locations.json
? Show only BSSIDs that have moved? Yes
? Minimum distance (meters) to consider as movement: 20

Configuration complete.

Processing 35 BSSIDs from bssids.txt with concurrency 5...
Successfully geolocated 35 unique BSSIDs.
Comparing current locations with previous data...
Movement detected for 00:11:22:33:44:55: 0.125 km
Movement detected for aa:bb:cc:dd:ee:ff: 0.081 km
Detected 2 BSSIDs that moved >= 20 meters.
Filtering output to only include 2 moved BSSIDs.

JSON data written to new_locations.json
KML data written to new_locations.kml
```

## Features

- Geolocate WiFi BSSIDs with high accuracy using Apple's location services
- Process individual BSSIDs or bulk process from files
- Multiple output formats: Console, JSON, TSV, KML (for Google Maps/Earth)
- Compare current locations with previous results to detect movement
- Scan local WiFi networks and map them in a single step (Windows only)
- Interactive mode available for easier configuration

## Installation

Ensure you have [Node.js](https://nodejs.org/) (which includes npm) installed.

```bash
# Clone the repository
git clone https://github.com/koff75/bssid-geolocator-node.git
cd bssid-geolocator-node

# Install dependencies (this also generates the protobuf JS file)
npm install
```

## Usage

### BSSID Geolocator

This is the core tool for geolocating WiFi BSSIDs.

```bash
# Basic usage for a single BSSID
node bssid-geolocator.js -b 00:11:22:33:44:55

# Process a file with multiple BSSIDs (one per line)
node bssid-geolocator.js -f bssids.txt

# Interactive mode (recommended for first-time users)
node bssid-geolocator.js -i

# Save results to KML file (for Google Maps/Earth)
node bssid-geolocator.js -f bssids.txt -k output.kml

# Save results to JSON file (recommended for later comparison)
node bssid-geolocator.js -f bssids.txt -j output.json

# Compare with previous results to detect movement
node bssid-geolocator.js -f bssids.txt -j new_output.json --compare previous_output.json

# Show only BSSIDs that have moved at least 20 meters
node bssid-geolocator.js -f bssids.txt --compare previous_output.json --movement-only --min-distance 20

# Filter by horizontal accuracy (in meters)
node bssid-geolocator.js -f bssids.txt --max-hacc 100
```

#### Command Line Options

```
Options:
  -b, --bssid         Single BSSID to geolocate (e.g., 00:11:22:33:44:55)
  -f, --infile        File of BSSIDs to geolocate (one per line)
  -k, --kml           Output KML filename
  -o, --outfile       Write output to TSV file (ignored if --json-out is used)
  -j, --json-out      Write output to JSON file (recommended for comparing)
  -c, --concurrency   Maximum concurrent requests [default: 5]
  --compare           Path to previous JSON results file for movement comparison
  --movement-only     Output only BSSIDs that have moved significantly
  --min-distance      Minimum distance (meters) to consider as movement [default: 10]
  --max-hacc          Maximum horizontal accuracy (meters) to consider a location valid (-1 to disable) [default: -1]
  -i, --interactive   Run in interactive configuration mode
  -h, --help          Show help
```

### WiFi Scanner and Mapper (Windows Only)

This tool scans for nearby WiFi networks and creates a map of their locations.

```bash
# Scan nearby WiFi networks and create a KML map
node scan_and_map.js
```

The script will:
1. Scan for nearby WiFi networks using Windows' `netsh` command
2. Geolocate each network's BSSID
3. Generate a `scanned_wifi_map.kml` file you can open in Google Earth or import into Google Maps

## Output Formats

### Console Output
The default output to console looks like:
```
BSSID            Latitude      Longitude      Ch  Hacc Timestamp
00:11:22:33:44:55 37.33182490  -122.03118133 1   65   10:42:26 AM
```

### KML Files
KML files can be opened with Google Earth or imported into Google Maps "My Maps" to visualize WiFi locations. When comparing data, the KML includes:
- Yellow pins: Regular WiFi points
- Red pins: Previous locations of moved BSSIDs
- Green pins: Current locations of moved BSSIDs
- Magenta lines: Movement paths

### JSON Files
JSON output includes comprehensive data about each BSSID, including:
- Coordinates (latitude, longitude)
- Horizontal accuracy (hacc)
- Channel information
- Timestamp
- Movement data (when using --compare)

## How It Works

The tool sends WiFi BSSID information to Apple's location services in a format similar to what iOS devices use for WiFi-based positioning. Apple's service returns estimated latitude and longitude based on their database of known WiFi networks. This is an unofficial use of their API and may be subject to limitations or changes without notice.

## Dependencies

- Node.js and npm
- For Windows scanning: Windows OS with `netsh` command available

Main npm packages:
- axios: For HTTP requests
- protobufjs: For encoding/decoding Apple's protocol buffer format
- xmlbuilder2: For generating KML files
- yargs: For command line argument parsing
- inquirer: For interactive mode
- p-limit: For controlling request concurrency
- iconv-lite: For character encoding conversion (Windows scanning)

## Limitations

- The accuracy of locations depends on Apple's database
- Some BSSIDs may not be found in Apple's database
- The service may have rate limits
- The WiFi scanning feature only works on Windows systems


## Technical Details

### Precision & Accuracy

The geolocation data provided by this tool includes several important metrics:

- **Horizontal Accuracy (hacc)**: Measured in meters, this value indicates the precision radius of the returned coordinates. Lower values (e.g., 10-30m) indicate high confidence locations, while higher values (100m+) suggest less precise data.

- **Coordinate Precision**: Coordinates are returned with 8 decimal places, theoretically offering centimeter-level positioning. However, the actual accuracy depends on Apple's database quality for that particular area.

- **Invalid Locations**: The API sometimes returns coordinates at (-180, -180) for BSSIDs it cannot locate. The tool automatically identifies and flags these as invalid.

- **Accuracy Filtering**: The `--max-hacc` parameter allows filtering out low-confidence results, letting you specify the maximum acceptable horizontal accuracy in meters.

### Request Handling

- **Concurrency Control**: The tool intelligently manages concurrent API requests using the p-limit library. The default concurrency of 5 simultaneous requests balances between speed and avoiding API rate limits.

- **Exponential Backoff**: The system handles API throttling or temporary failures by implementing automatic retries with exponential backoff for failed requests.

- **Error Handling**: Comprehensive error handling captures and reports various failure modes, including network issues, malformed responses, and API rejections.

- **Timeout Management**: Requests that take too long are properly canceled to prevent resource leaks and ensure the tool remains responsive.

### Data Processing

- **BSSID Normalization**: All MAC addresses are normalized to a consistent format (XX:XX:XX:XX:XX:XX with lowercase hexadecimal digits) to ensure reliable matching and comparisons.

- **Movement Detection**: When comparing datasets, the system accounts for both the distance between points AND the reported accuracy of both measurements. A movement is only considered valid if the distance exceeds the sum of both location accuracies plus the minimum threshold.

- **Timestamp Precision**: All geolocation events are timestamped with millisecond precision for accurate temporal analysis.

- **Channel Information**: The tool captures WiFi channel information when available, providing additional context beyond just geographic coordinates.

### Performance Considerations

- **Memory Efficiency**: Even when processing thousands of BSSIDs, the tool maintains a small memory footprint by streaming results.

- **Scaling Concurrency**: For large datasets, you can adjust the concurrency parameter (`-c`) based on your network capabilities. Values between 5-10 are generally optimal, while higher values might trigger API rate limiting.

- **Processing Speed**: With default settings, the tool processes approximately 300-500 BSSIDs per minute, depending on network conditions and API response times.

- **Bulk Processing**: For very large datasets (10,000+ BSSIDs), consider splitting the input file and running multiple instances with lower concurrency values.


## ⚠️ Legal Disclaimer

This tool is provided for **EDUCATIONAL AND RESEARCH PURPOSES ONLY**. The authors do not endorse or encourage:
- Bypassing API restrictions
- Violating Apple's Terms of Service
- Tracking individuals without explicit consent

By using this software:
- You acknowledge that this is NOT an officially supported or endorsed use of Apple's services
- You accept ALL responsibility and liability for any consequences
- You agree to use this tool in compliance with all applicable laws and regulations

The authors of this software cannot be held responsible for any legal issues, account suspensions, or other consequences that may arise from using this tool.
