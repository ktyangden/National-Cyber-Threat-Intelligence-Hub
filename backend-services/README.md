# Backend Services Setup Guide

This directory contains all backend microservices for the Threat Intelligence Hub.

## Prerequisites

- **Python 3.10+**
- **Node.js 18+ & npm**
- **Kafka** (for log streaming)
- **MongoDB** (for user authentication)
- **VS Code Terminal Manager Extension** (recommended for multi-service management)

---

## Quick Start with Terminal Manager

For the easiest setup experience, use the Terminal Manager extension to run all services simultaneously:

### Step 1: Install Terminal Manager Extension
1. Open VS Code Extensions panel (`Ctrl + Shift + X`)
2. Search for **"Terminal Manager"** (icon matches the Terminal icon)
3. Install the extension

### Step 2: Launch All Services
1. Close all existing terminals
2. Press `Ctrl + Shift + P` to open the Command Palette
3. Search for: **"Terminals: Run"**
4. Select "Run the workspace terminals configuration"

This will automatically start all backend services in separate terminal windows with proper configuration.

---

## Manual Setup Instructions

If you prefer manual setup or need to run services individually, follow these instructions:

### Python Services Setup

#### 1. Install Python Dependencies

Install all required Python packages:

```bash
pip install daphne django djangorestframework djangorestframework-simplejwt django-cors-headers pymongo requests channels PyJWT asgiref fastapi pydantic uvicorn geoip2 maxminddb
```

Or install service-specific requirements:

**Log Service:**
```bash
cd log-service
pip install -r requirements.txt
```

**Auth Service & Alert Service:**
```bash
# Install Django and DRF dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pymongo PyJWT channels asgiref
```

#### 2. Log Service - GeoIP Setup

The log service uses MaxMind GeoLite2 database to convert IP addresses to country codes for the attack heatmap.

##### Download GeoLite2 Database

**Create a MaxMind Account (Free):**
1. Visit https://www.maxmind.com/en/geolite2/signup
2. Sign up and verify your email
3. Log in and navigate to "Manage License Keys"
4. Generate a new license key and copy it

**Download the Database (Choose One Method):**

**Option A: Manual Download** (Simplest)
- Go to https://www.maxmind.com/en/accounts/current/geoip/downloads
- Download "GeoLite2-Country" (MMDB format)
- Extract the `.mmdb` file

**Option B: Using maxmind-geolite2-reader** (Recommended)
```bash
pip install maxmind-geolite2-reader
```
This includes a built-in database (no manual download needed).

**Option C: Using GeoIP Update Tool** (Auto-updates)
```bash
# Ubuntu/Debian:
sudo apt-get install geoipupdate

# macOS:
brew install geoipupdate

# Configure with your license key
# Edit /etc/GeoIP.conf or create ~/.geoip/GeoIP.conf
# Add your AccountID and LicenseKey, then run:
geoipupdate
```

##### Place the Database File

Place `GeoLite2-Country.mmdb` in one of these locations (checked in order):

1. `backend-services/log-service/GeoLite2-Country.mmdb` *(recommended)*
2. `backend-services/log-service/logs/GeoLite2-Country.mmdb`
3. Current working directory: `GeoLite2-Country.mmdb`

Or set a custom path:
```bash
export GEOIP_DB_PATH=/path/to/GeoLite2-Country.mmdb
```

##### Verify GeoIP Setup

On startup, check logs for:
```
GeoIP database loaded from /path/to/GeoLite2-Country.mmdb
```

If you see a warning, ensure:
- File exists at an expected location
- File has `.mmdb` extension
- File is readable

---

### Node.js Services Setup

#### 1. Gateway Service

```bash
cd gateway
npm install
```

**Key Dependencies:** express, axios, jsonwebtoken, mongoose, cors, cookie-parser, dotenv

#### 2. ETL Service

```bash
cd etl/etl-service
npm install
```

**Key Dependencies:** kafkajs, axios, dotenv

#### 3. Data Ingestion Service

```bash
cd etl/data-ingestion
npm install
```

**Key Dependencies:** kafkajs, fs

---

## Infrastructure Setup

### Kafka Setup

Kafka is required for log streaming between services.

**Using Docker Compose (Recommended):**
```bash
cd etl/kafka
docker-compose up -d
```

This starts:
- Zookeeper (port 2181)
- Kafka Broker (port 9092)

**Manual Setup:**
1. Download Kafka from https://kafka.apache.org/downloads
2. Start Zookeeper:
   ```bash
   bin/zookeeper-server-start.sh config/zookeeper.properties
   ```
3. Start Kafka:
   ```bash
   bin/kafka-server-start.sh config/server.properties
   ```

### MongoDB Setup

MongoDB is required for user authentication.

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Manual Setup:**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service

---

## Running Services

### Log Service

**Port:** 8001

**Key Endpoints:**
- `POST /send-log` - Receive classified logs (requires G2S token)
- `GET /country-counts` - Get aggregated country attack counts
- `POST /reset-counts` - Reset country counts
- `GET /recent-logs` - Get recent logs (last 1000)
- `WS /ws/logs/` - WebSocket endpoint for real-time log streaming

**Start with ASGI (required for WebSockets):**
```bash
cd log-service
uvicorn log_service.asgi:application --host 0.0.0.0 --port 8001
```

Or with Django development server (WebSockets disabled):
```bash
python manage.py runserver 8001
```

### Gateway Service

**Port:** 3002

**Routes:**
- `/api/v1/auth/*` - Authentication routes
- `/api/v1/users/*` - User management routes
- `/api/v1/micro/*` - Microservice proxy routes
- `/api/v1/ext/logs/*` - External log service routes

**Start:**
```bash
cd gateway
node src/index.js
```

### ETL Service

**Function:** Consumes logs from Kafka, sends to ML service for classification, forwards to log service.

**Start:**
```bash
cd etl/etl-service
node index.js
```

### Data Ingestion Service

**Function:** Streams logs from JSON file to Kafka topic.

**Start:**
```bash
cd etl/data-ingestion
node index.js
```

**Note:** Processes all logs from `data/logs.json` and streams them to Kafka with appropriate delays.

---

## Service Architecture

```
Data Ingestion → Kafka → ETL Service → ML Service → Log Service
                                                          ↓
                                                    WebSocket
                                                          ↓
                                                    Frontend
```

**Data Flow:**
1. Data Ingestion reads logs from JSON and publishes to Kafka
2. ETL Service consumes from Kafka and sends to ML Service for classification
3. ML Service classifies logs and returns results
4. ETL Service forwards classified logs to Log Service
5. Log Service processes IPs, updates country counts, and broadcasts via WebSocket
6. Frontend receives real-time logs via WebSocket connection

---

## Testing Services

### Test Log Service

```bash
# Test country counts endpoint
curl http://localhost:8001/country-counts

# Test via gateway
curl http://localhost:3002/api/v1/ext/logs/country-counts

# Test recent logs
curl http://localhost:8001/recent-logs?limit=10
```

### Test WebSocket Connection

```bash
# Using wscat (install: npm install -g wscat)
wscat -c ws://localhost:8001/ws/logs/
```

---

## Troubleshooting

### GeoIP Database Not Found

- Verify `GeoLite2-Country.mmdb` exists in expected locations
- Check file has `.mmdb` extension
- Confirm file permissions (must be readable)
- Set `GEOIP_DB_PATH` environment variable if using custom location

### WebSocket Connection Failed

- Ensure log-service runs with ASGI server (uvicorn), not Django dev server
- Verify port 8001 is not blocked by firewall
- Confirm WebSocket endpoint: `ws://localhost:8001/ws/logs/`

### No Country Counts Showing

- Verify logs contain `src_ip` field
- Check that GeoIP database loaded successfully (review startup logs)
- Test endpoint accessibility: `curl http://localhost:8001/country-counts`
- Confirm logs are flowing through the processing pipeline

### Kafka Connection Issues

- Ensure Kafka is running (ports 2181 and 9092)
- Verify broker accessibility at `localhost:9092`
- List topics: `kafka-topics.sh --list --bootstrap-server localhost:9092`

### MongoDB Connection Issues

- Confirm MongoDB is running (port 27017)
- Verify connection string in gateway configuration
- Review MongoDB logs for errors

### Terminal Manager Not Working

- Ensure Terminal Manager extension is properly installed
- Verify workspace contains `.vscode/terminals.json` configuration file
- Try restarting VS Code
- Check extension compatibility with your VS Code version

---

## Important Notes

- **GeoIP Database Updates**: Refresh the GeoLite2 database monthly for accurate geolocation data
- **Memory Storage**: Country counts and recent logs are stored in-memory and reset on service restart
- **Private IPs**: Private IP addresses (192.168.x.x, 10.x.x.x, etc.) won't be geolocated (return null)
- **Performance**: GeoIP lookups are optimized and occur automatically for each log
- **Log Retention**: Most recent 1000 logs are kept in memory for new WebSocket connections
- **Service Dependencies**: Ensure Kafka and MongoDB are running before starting dependent services

---

## Additional Resources

- [MaxMind GeoLite2 Documentation](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data)
- [GeoIP2 Python Library](https://github.com/maxmind/GeoIP2-python)
- [Django Channels Documentation](https://channels.readthedocs.io/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Terminal Manager Extension](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-terminals)