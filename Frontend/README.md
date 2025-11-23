# Frontend Setup Guide

React + Vite + TypeScript + Tailwind CSS

## Prerequisites

- **Node.js 18+**
- **npm** or **yarn**

---

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs all required dependencies including:
- React 19
- Vite
- TypeScript
- Tailwind CSS
- react-map-gl
- mapbox-gl
- And other project dependencies

### 2. Install Type Definitions (if needed)

```bash
npm install --save-dev @types/react-map-gl
```

---

## Mapbox Setup

The heatmap visualization uses Mapbox GL for interactive world maps.

### Get Mapbox Access Token

1. **Create a Mapbox Account** (Free):
   - Go to https://account.mapbox.com/auth/signup/
   - Sign up for a free account

2. **Get Your Access Token**:
   - Log in to your Mapbox account
   - Go to https://account.mapbox.com/access-tokens/
   - Copy your default public token or create a new one

3. **Set the Token**:
   - Open `src/pages/Feeds/Map.tsx`
   - Replace `YOUR_MAPBOX_ACCESS_TOKEN` with your actual token:
   ```typescript
   const MAPBOX_TOKEN = 'your-mapbox-access-token-here';
   ```

   Or set it as an environment variable:
   ```bash
   # Create .env file in Frontend directory
   VITE_MAPBOX_TOKEN=your-mapbox-access-token-here
   ```
   
   Then use in code:
   ```typescript
   const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'your-fallback-token';
   ```

---

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Features

### 1. Attack Heatmap

**Location:** `/threat-feeds` → "Attack Heatmap" tab

**Features:**
- Interactive world map showing attack distribution by country
- Real-time updates every 5 seconds
- Color-coded intensity based on attack count
- Hover tooltips showing country and attack count
- Top 10 countries table with intensity indicators

**Components:**
- `src/pages/Feeds/Map.tsx` - Main map component
- `src/lib/mapUtils.ts` - Map utilities (country matching, GeoJSON processing)

**API Endpoint:**
- `GET /api/v1/ext/logs/country-counts` - Fetches country attack counts

### 2. Phishing Domains

**Location:** `/threat-feeds` → "Phishing Domains" tab

**Features:**
- List of detected phishing domains
- Real-time updates

**Components:**
- `src/pages/Feeds/Phishes.tsx` - Phishing domains component

### 3. Real-time Logs (Honey)

**Location:** `/honey` (if route exists)

**Features:**
- Real-time log streaming via WebSocket
- Automatic reconnection on connection loss
- Recent logs fetched on connection
- Log counter (total received vs displayed)

**Components:**
- `src/pages/Honey.tsx` - Log viewer component

**WebSocket Endpoint:**
- `ws://localhost:8001/ws/logs/` - Real-time log stream

**API Endpoint:**
- `GET http://localhost:8001/recent-logs?limit=100` - Fetch recent logs

---

## Configuration

### Vite Proxy Configuration

The `vite.config.ts` includes proxy settings for API calls:

```typescript
server: {
  proxy: {
    '/api/v1/ext': {
      target: 'http://localhost:3002',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

This proxies all `/api/v1/ext/*` requests to the gateway service.

---

## Troubleshooting

### Map Not Displaying

- **Check Mapbox Token**: Ensure your Mapbox access token is set correctly
- **Check Console**: Look for Mapbox API errors (403 Forbidden usually means invalid token)
- **Check Network**: Verify that country-counts endpoint is accessible
- **Check GeoJSON**: Ensure world GeoJSON is loading (check Network tab)

### WebSocket Connection Failed

- **Check Backend**: Ensure log-service is running with ASGI server (uvicorn)
- **Check Port**: Verify port 8001 is accessible
- **Check Console**: Look for WebSocket connection errors
- **Auto-reconnect**: The component will automatically retry up to 5 times

### No Data on Heatmap

- **Check Backend**: Ensure log-service is running and processing logs
- **Check API**: Test endpoint: `curl http://localhost:3002/api/v1/ext/logs/country-counts`
- **Check Console**: Look for API errors in browser console
- **Check GeoIP**: Ensure GeoIP database is loaded in log-service

### Build Errors

- **TypeScript Errors**: Run `npm run build` to see detailed TypeScript errors
- **Missing Dependencies**: Run `npm install` to ensure all dependencies are installed
- **Node Version**: Ensure you're using Node.js 18+

---

## Environment Variables

Create a `.env` file in the Frontend directory:

```env
VITE_MAPBOX_TOKEN=your-mapbox-access-token-here
VITE_API_BASE_URL=http://localhost:3002
```

Access in code:
```typescript
const token = import.meta.env.VITE_MAPBOX_TOKEN;
```

---

## Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM renderer
- `vite` - Build tool
- `typescript` - Type safety

### Styling
- `tailwindcss` - Utility-first CSS framework
- `@tailwindcss/vite` - Tailwind Vite plugin

### Maps
- `react-map-gl` - React wrapper for Mapbox GL
- `mapbox-gl` - Mapbox GL JS library

### Other
- See `package.json` for complete list

---

## Development Tips

1. **Hot Module Replacement**: Changes are reflected immediately in development
2. **TypeScript**: Use TypeScript for type safety and better IDE support
3. **Tailwind**: Use Tailwind utility classes for styling
4. **Component Structure**: Keep components modular and reusable
5. **Error Handling**: Always handle API errors and WebSocket disconnections gracefully

---

## Additional Resources

- React Documentation: https://react.dev/
- Vite Documentation: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/
- Mapbox GL JS: https://docs.mapbox.com/mapbox-gl-js/
- react-map-gl: https://visgl.github.io/react-map-gl/
