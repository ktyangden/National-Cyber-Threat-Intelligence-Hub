# 📘 **Project Setup Guide**

## 🔧 **Prerequisites**

Make sure you have the following installed:

* **Python 3.10+**
* **Node.js 18+ & npm**
* **Git**

---

# 🖥️ **Developer Environment Setup**

## 🔄 **Open Preconfigured Terminals**

1. Install Terminal Manager Extensions in your IDE (Icon same as Terminal)
2. Close all existing terminals
3. Press **`Ctrl + Shift + P`**
4. Search for: **`Terminals: Run`**
5. Run the workspace terminals configuration

   * This opens multiple terminals with pre-written commands for each microservice

---

# 🐍 **Backend (Python / DRF) — First-Time Setup**

Before running the backend services for the first time, install required Python libraries:

```bash
pip install daphne django djangorestframework djangorestframework-simplejwt django-cors-headers pymongo requests channels PyJWT asgiref fastapi pydantic uvicorn
```

These libraries are required for:

* Django + DRF
* MongoDB client
* JWT authentication
* WebSockets using Channels
* FastAPI microservices
* Model validation + async server

---

# 🟩 **Node.js Services — First-Time Setup**

Run `npm install` in the following microservices:

### 📌 1. **Data Ingestion Service**

```
npm install
```

### 📌 2. **ETL Service**

```
npm install
```

### 📌 3. **Gateway Service**

> ⚠️ When the terminal opens automatically, it will be inside `gateway/src`.
> Make sure to move one directory up before installing:

```
cd ..
npm install
```

This installs dependencies for:

* Express gateway
* Request routing
* Service communication
* Logging middleware

---

# 🚀 **Ready to Run**

After the installations are done, you can start each service using their respective run scripts commands(already included in the terminal presets).