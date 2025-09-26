# 📡 WiFi Tracker - Professional Network Geolocation

**🌐 Live Demo:** [wifitracker.fun](https://wifitracker.fun)

> **Discover and geolocate any WiFi network worldwide using advanced BSSID triangulation technology**

Transform any WiFi BSSID into precise GPS coordinates using Apple's WiFi Positioning System. Built with modern web technologies and professional-grade APIs.

![WiFi Tracker Demo](https://img.shields.io/badge/Demo-wifitracker.fun-blue?style=for-the-badge&logo=wifi)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Apple%20WPS-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)

## ✨ What Makes This Special?

🎯 **Real iPhone Technology** - Uses the same Apple WPS API that powers iPhone location services  
🗺️ **Live Interactive Maps** - Visualize networks with dynamic Google Maps integration  
📱 **Professional Web Interface** - Modern React app with stunning UI effects  
🔍 **Advanced Triangulation** - Discover ALL WiFi networks around any location  
⚡ **Lightning Fast** - Serverless architecture with global CDN deployment  
🔒 **Privacy-First** - No data storage, client-side processing, secure HTTPS

## 🚀 Quick Start

**Try it now:** Just visit [wifitracker.fun](https://wifitracker.fun) and enter any BSSID!

Example BSSID to test: `3a:07:16:a3:61:a4`

## 🌟 Core Features

### 🎯 **Single BSSID Geolocation**
Enter any WiFi BSSID and get instant GPS coordinates with accuracy metrics.

### 📱 **iPhone Triangulation Mode**  
Revolutionary feature that mimics iPhone's positioning system:
- Enter your connected WiFi BSSID
- Discover **ALL** nearby networks Apple knows about
- Get the same precision your iPhone uses for indoor positioning

### 🗺️ **Interactive Network Maps**
- **Complete View**: See all discovered networks with pins on Google Maps
- **Real-time filtering** by channel, distance, and accuracy
- **Click any network** to open its location in Google Maps

### ⚡ **Professional Tools**
- **Advanced analytics** with network density and coverage radius
- **Export capabilities** for security auditing and research
- **Mobile-optimized** interface that works on any device

## 🛠️ Technology Stack

**Frontend:**
- ⚛️ **React.js** with Vite for lightning-fast development
- 🎨 **Tailwind CSS** + **Aceternity UI** for stunning visual effects  
- 🗺️ **Google Maps API** for interactive network visualization

**Backend:**
- ⚡ **Node.js serverless functions** on Vercel
- 🍎 **Apple WPS API** integration for accurate positioning
- 📊 **Protocol Buffers** for efficient data communication

**Infrastructure:**
- 🚀 **Vercel deployment** with global CDN
- 🔒 **HTTPS-only** with security headers
- 📱 **PWA-ready** with mobile optimization

## 🧠 How It Works

WiFi Tracker leverages the same positioning technology that powers your iPhone's location services:

1. **BSSID Input** → Enter any WiFi network's MAC address
2. **Apple WPS Query** → Securely query Apple's WiFi positioning database  
3. **Triangulation** → Get precise GPS coordinates + nearby network discovery
4. **Visualization** → Interactive maps with real-time filtering and analytics

> **Fun Fact:** When you enable WiFi positioning on your iPhone, it's using the exact same Apple WPS API that powers this tool!

## 🎯 Use Cases

**🔒 Security Professionals:**
- WiFi network security auditing and penetration testing
- Rogue access point detection and analysis  
- Network infrastructure mapping and assessment

**🏢 IT Administrators:**
- WiFi coverage planning and optimization
- Site surveys and signal strength analysis
- Network troubleshooting and diagnostics

**🔬 Researchers & Developers:**
- Location-based services development and testing
- Indoor positioning system research
- WiFi database analysis and management

**📊 Data Analysts:**
- Network density studies and urban planning
- Telecommunications infrastructure research
- Geospatial analysis and visualization

## 💻 Local Development

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

## 🔧 Command Line Tools (Optional)

For advanced users, this repository also includes Node.js CLI tools:

```bash
# Geolocate a single BSSID
node bssid-geolocator.js -b 00:11:22:33:44:55

# Process multiple BSSIDs from file
node bssid-geolocator.js -f bssids.txt -k output.kml

# Windows WiFi scanning and mapping
node scan_and_map.js
```

## 🌍 API & Performance

- **Accuracy**: Typically 10-50 meter precision using Apple's WPS database
- **Speed**: Sub-second response times with global CDN  
- **Coverage**: Worldwide WiFi network database via Apple's infrastructure
- **Reliability**: 99.9% uptime with serverless architecture

## 🤝 Contributing

Found a bug or have a feature idea? We'd love your help!

1. 🍴 **Fork** this repository
2. 🌿 **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🔄 **Open** a Pull Request

## 📜 License & Disclaimer

**Educational and Research Use Only**

This project demonstrates WiFi geolocation techniques for educational purposes. Users are responsible for compliance with applicable laws and Apple's Terms of Service.

- ✅ **Educational research and learning**
- ✅ **Network security auditing (authorized)**  
- ✅ **Infrastructure planning and analysis**
- ❌ **Unauthorized tracking or surveillance**
- ❌ **Commercial use without proper licensing**

---

**⭐ Star this repo if you find it useful!**

**🌐 Try it live:** [wifitracker.fun](https://wifitracker.fun)
