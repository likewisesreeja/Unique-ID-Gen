# SnowGrid — Distributed ID Generator Frontend

A polished React + TypeScript dashboard for the Chapter 7 distributed unique ID generator project.

## Requirements
- Node.js 18+ (Node 20+ recommended)
- VS Code

## Run
```bash
npm install
npm run dev
```
Open the URL shown by Vite, usually:
http://localhost:5173

## Backend connection
The UI expects the backend at:
http://localhost:8080/api/v1

You can change it with a Vite environment variable:
```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Expected endpoints:
- POST /ids
- GET /status

Expected POST /ids JSON:
```json
{
  "id": "738492384729384729",
  "workerId": 2,
  "timestamp": 17264001,
  "sequence": 42,
  "algorithm": "SNOWFLAKE"
}
```

## Demo mode
If the backend is not running, the frontend automatically uses mock data so you can build and present the UI before the backend is ready. The top-right badge will say DEMO MODE.

## Pages
- Overview
- Generate & Explore
- Worker Fleet
- Performance Lab
- Algorithm Lab

## Build
```bash
npm run build
```
