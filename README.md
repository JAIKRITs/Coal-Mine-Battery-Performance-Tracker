# 🚀 Coal Mine Battery Performance Tracker
### *IoT + WebXR-based Immersive Monitoring System*

---

## 📌 Overview

This project is an **IoT-driven real-time monitoring system** that combines:

- 📡 Sensor Data Acquisition (Raspberry Pi 5 + BME680)
- 🌐 React + Three.js 3D Dashboard
- 🧠 AI-based Environmental Analysis (Ollama LLM)
- 🗺️ Geospatial Tracking (Mapbox)

Instead of traditional flat dashboards, this system provides an **immersive 3D control room** where users can:

- Visualize environmental & battery data
- Interact with panels in a spatial environment
- Receive AI-driven insights & alerts

---

## 🧠 Key Idea

Transform raw sensor data into **interactive 3D insights combined with AI-based interpretation**.
The system solves the problem of fragmented monitoring by integrating multiple data streams into a single immersive interface.

---

## 🏗️ System Architecture
[Sensors] → [Raspberry Pi Backend] → [REST + Socket.IO] → [React + Three.js Frontend] → [3D Dashboard + AI Analysis]

### Layers:
- **Hardware Layer** → Raspberry Pi 5 + BME680
- **Backend Layer** → Flask + Socket.IO
- **Frontend Layer** → React + Three.js + WebXR
- **AI Layer** → Ollama (Qwen model)

---

## ⚙️ Tech Stack

### 🖥️ Frontend
- React (Vite)
- Three.js
- React Three Fiber
- React Three XR
- Recharts
- Mapbox GL

### ⚙️ Backend
- Flask
- Flask-SocketIO
- JSONL storage
- FileLock (concurrency safety)

### 🔌 Hardware
- Raspberry Pi 5
- BME680 Sensor

### 🧠 AI
- Ollama (Local LLM)
- Structured JSON analysis output

---

## 🌟 Features

### 📊 Real-Time Sensor Monitoring
- Temperature
- Humidity
- Pressure
- Gas resistance
- Voltage (currently simulated)

---

### 🧊 Immersive 3D Dashboard
- Spatial panel arrangement
- Camera navigation & transitions
- HDRI + gradient environments

---

### 🎛️ Multiple Interaction Modes

| Mode | Description |
|------|-------------|
| Dashboard Mode | Full control room view |
| Slider Mode | Focus one panel at a time |
| Move Mode | Rearrange panels |
| Experience Mode | Stand inside dashboard |

---

### 📈 Advanced Visual Analytics
- Psychrometric relation panel
- Dual-axis temperature-humidity graph
- Gauge-based overview
- Voltage vs Temperature comparison

---

### 🗺️ Location Tracking
- Mapbox integration
- Embedded + full-screen map
- 3D terrain visualization

---

### 🔊 Spatial Audio
- Directional sound using Three.js
- GSAP-based smooth transitions

---

### 🧠 AI-Powered Analysis
- Runs periodically
- Provides:
  - Situation summary
  - Threat level
  - Alerts
  - Recommendations

---

## 🔄 Data Flow

1. Raspberry Pi reads sensor data every few seconds
2. Data stored in `sensor_data.jsonl`
3. Backend:
   - `/data` → latest reading
   - `/history` → historical data
   - `/analysis` → AI insights
4. Frontend:
   - Fetch + normalize data
   - Stream via Socket.IO
   - Render in 3D panels

---

## 🛠️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/JAIKRITs/Coal-Mine-Battery-Performance-Tracker.git
cd Coal-Mine-Battery-Performance-Tracker
```

### 2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3️⃣ Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 4️⃣ Environment Variables

Create `.env` in `frontend/`:

```env
VITE_SENSOR_API_BASE_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### 5️⃣ Run Ollama (Optional but Recommended)
```bash
ollama run qwen2.5:0.5b
```

---

## 📂 Project Structure
├── frontend/
│   ├── components/
│   ├── hooks/
│   ├── scenes/
│   └── App.jsx
│
├── backend/
│   ├── app.py
│   ├── sensor_data.jsonl
│   └── analysis logic
│
└── README.md

---

## 🎯 Learning Outcomes

- Built a full-stack IoT system
- Learned WebXR + 3D visualization
- Integrated real-time streaming (Socket.IO)
- Designed AI-assisted dashboards
- Developed modular React architecture

---

## ⭐ If you like this project

Give it a ⭐ on [GitHub](https://github.com/JAIKRITs/Coal-Mine-Battery-Performance-Tracker)!
