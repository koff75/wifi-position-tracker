# Environment Variables

Create a `.env` file in the `web/` directory with the following variables:

```bash
# Google Maps API Configuration
# Get your API key from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Production URL
VITE_APP_URL=https://wifitracker.fun
```

## Setup Instructions

1. **Get Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select existing one
   - Enable "Maps Embed API" and "Maps Static API"
   - Create credentials (API Key)
   - Restrict the key to your domain for security

2. **Local Development:**
   ```bash
   cd web/
   echo "VITE_GOOGLE_MAPS_API_KEY=your_actual_key_here" > .env
   npm run dev
   ```

3. **Vercel Deployment:**
   - Add `VITE_GOOGLE_MAPS_API_KEY` in Vercel Environment Variables
   - Value: Your actual Google Maps API key
