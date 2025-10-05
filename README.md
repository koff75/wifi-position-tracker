# 📡 WiFi Tracker - Network Geolocation

**🌐 Live Demo:** [wifitracker.fun](https://wifitracker.fun)

> **Discover and geolocate any WiFi network worldwide using BSSID**

Transform any WiFi BSSID into precise GPS coordinates using WiFi Positioning. Built with modern web technologies.

![WiFi Tracker Demo](https://img.shields.io/badge/Demo-wifitracker.fun-blue?style=for-the-badge&logo=wifi)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Apple%20WPS-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)

## ✨ Context

🎯 **Technology** - Uses the same Apple WPS API that powers location services  
🗺️ **Maps** - Visualize networks with dynamic Google Maps integration  
📱 **Web Interface** - Modern React app with stunning UI effects  
⚡ **Fast** - Serverless architecture with global CDN deployment  

## 🚀 Quick start

**Try it now:** Just visit [wifitracker.fun](https://wifitracker.fun) and enter any BSSID!

## 🌟 Core features

### 🎯 **Single BSSID Geolocation**
Enter any WiFi BSSID and get instant GPS coordinates with accuracy metrics.

### 📱 **How does it work**  
Feature that mimics iPhone's positioning system:
- Enter your connected WiFi BSSID
- Discover **ALL** nearby networks Apple knows about
- Get the same precision your iPhone uses for indoor positioning

### 🗺️ **Network Maps**
- **Complete View**: See all discovered networks with pins on Google Maps
- **Filtering** by channel, distance, and accuracy
- **Click** to open its location in Google Maps

## 🛠️ Technology stack

## Overview
WiFi Tracker is a web application for WiFi network geolocation and BSSID triangulation using WPS API.

## Key features
- 🎯 BSSID Geolocation
- 📱 iPhone Triangulation Technology  
- 🗺️ Interactive Google Maps
- 🔍 Network Discovery
- 📊 Advanced Analytics

## Technology Stack
- React.js + Vite
- Aceternity UI
- Google Maps API
- Node.js serverless functions
- Vercel deployment + Cloudflare WAF


## 💻 Local dev

Want to run your own instance or contribute? Easy setup:

```bash
# Clone the repository
git clone https://github.com/yourusername/wifi-tracker.git
cd wifi-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Command line tools

### 📡 **scan_and_map.js** - WiFi environment scan

Scans, analyzes, and maps your entire WiFi environment:

```bash
# Full environment scan with security audit
node scan_and_map.js

# Debug mode for detailed analysis
node scan_and_map.js --debug
```

**Sample Output:**
```
🏠 NETWORKS DETECTED - AUDIT
═══════════════════════════════════════════════════════════════════════════
SSID                     BSSID              SECUTITY      SIGNAL  CHA  GEOLOC
──────────────────────────────────────────────────────────────────────────
MyWiFi                   aa:bb:cc:dd:ee:ff  WPA2-AES      85%     6      ✅ YES
OpenNetwork              11:22:33:44:55:66  CRITIC      45%     11     ✅ YES



```

### 🌍 **bssid-geolocator.js** 


```bash
# Single BSSID with detailed output
node bssid-geolocator.js -b 00:11:22:33:44:55

# Batch processing from file
node bssid-geolocator.js -f bssids.txt -j results.json

# Interactive configuration mode
node bssid-geolocator.js -i

# Movement tracking and comparison
node bssid-geolocator.js -f bssids.txt --compare previous.json --movement-only

# High-precision filtering
node bssid-geolocator.js -f bssids.txt --max-hacc 50 -c 10
```

**🚀 Advanced Features:**

#### **📊 Multiple output formats**
```bash
# KML for Google Earth visualization
-k output.kml

# JSON for programmatic analysis  
-j results.json

# TSV for spreadsheet analysis
-o data.tsv

# Console output with real-time stats
(default stdout)
```

#### **🔍 Movement detection & tracking**
```bash
# Compare with previous scan to detect moved access points
--compare previous.json

# Only show networks that moved significantly  
--movement-only --min-distance 100

# Track AP movements over time with timestamps
```

#### **⚡ Performance & accuracy controls**
```bash
# Concurrent processing (1-50 simultaneous requests)
-c 10

# Accuracy filtering (only high-precision results)
--max-hacc 25

# Debug mode for API analysis
--debug
```

#### **🎯 Sample advanced workflow**
```bash
# Day 1: Initial scan and baseline
node bssid-geolocator.js -f corporate_aps.txt -j baseline_scan.json

# Day 30: Detect moved/new access points
node bssid-geolocator.js -f corporate_aps.txt --compare baseline_scan.json \
  --movement-only --min-distance 10 -k movements.kml

# Result: KML showing only APs that moved >10m with movement lines
```

**📈 Performance stats:**
- **Throughput**: Up to 50 concurrent BSSID lookups
- **Accuracy**: Sub-15 meter precision in urban areas  
- **Coverage**: Global Apple WPS database access
- **Output**: JSON, KML, TSV, and formatted console output

## 📜 Disclaimer

**Educational and Research Use Only**

This project demonstrates WiFi geolocation techniques for educational purposes. Users are responsible for compliance with applicable laws and Apple's Terms of Service.

- ✅ **Educational research and learning**


**🌐 Try it live:** [wifitracker.fun](https://wifitracker.fun)
