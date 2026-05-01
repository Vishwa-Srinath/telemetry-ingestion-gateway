# 🌐 Distributed Telemetry Ingestion Gateway

![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![Architecture: Edge-to-Cloud](https://img.shields.io/badge/Architecture-Edge--to--Cloud-blue?style=for-the-badge)
![Deployment: Railway & Supabase](https://img.shields.io/badge/Deployment-Railway%20%7C%20Supabase-purple?style=for-the-badge)

> An industrial-grade, end-to-end IoT telemetry pipeline designed to capture, route, store, and visualize real-time sensor data from multiple distributed microcontrollers. 

**[📸 PLACEHOLDER: Drag and drop a GIF here of your Grafana dashboard updating in real-time]**

---

## 📑 Table of Contents
1. [System Architecture](#-system-architecture)
2. [The Tech Stack](#-the-tech-stack)
3. [Hardware & Edge Tier](#️-hardware--edge-tier)
4. [Backend & API Tier](#-backend--api-tier)
5. [Database & Storage Tier](#-database--storage-tier)
6. [Visualization Tier](#-visualization-tier)
7. [API Documentation](#-api-documentation)

---

## 🏗 System Architecture

This project is significantly more complex than standard API CRUD apps. It represents a full **Data Engineering Pipeline** bypassing strict network firewalls using connection pooling.

**[📸 PLACEHOLDER: Drag and drop a system architecture diagram here. You can draw a quick one in draw.io or Excalidraw showing ESP32 -> Railway -> Supabase -> Grafana]**

The system operates in four distinct tiers:
1. **Edge Tier:** ESP32 nodes reading analog variable resistors (simulating cooling room sensors).
2. **Ingestion Tier:** A Node.js/Express REST API hosted on Railway, acting as the gateway.
3. **Storage Tier:** A Supabase PostgreSQL database utilizing TimescaleDB concepts for time-series optimization.
4. **Analytics Tier:** Grafana Cloud querying the database via a PgBouncer connection pooler (Port 6543) to visualize live data.

---

## 💻 The Tech Stack

*   **Hardware:** ESP32, Variable Resistors
*   **Backend:** Node.js, Express.js
*   **Hosting:** Railway (Continuous Deployment)
*   **Database:** PostgreSQL (Hosted on Supabase)
*   **Visualization:** Grafana Cloud
*   **Networking:** IPv4 Connection Pooling (Bypassing restrictive university/corporate firewalls)

---

## ⚙️ Hardware & Edge Tier

The edge nodes are responsible for gathering localized telemetry data. 

*   **Microcontrollers:** 3x ESP32 nodes (`mcu_node_01`, `mcu_node_02`, `mcu_node_03`).
*   **Sensors:** Variable resistors simulating environmental data (e.g., cooling room status).
*   **Behavior:** Nodes package data into a standard JSON payload and execute `POST` requests to the Railway endpoint every 5 seconds.

**[📸 PLACEHOLDER: Drag and drop a photo of your physical breadboard/ESP32 setup here]**

---

## 🌐 Backend & API Tier

The gateway is built with Node.js and Express, designed for high availability and low latency. It is deployed via **Railway**.

*   Validates incoming JSON payloads from the Edge nodes.
*   Maps raw hardware IDs (e.g., `mcu_node_01`) to specific relational database identities.
*   Executes secure SQL `INSERT` commands to the Supabase instance.

---

## 🗄 Database & Storage Tier

Data is stored in **Supabase (PostgreSQL)**. The schema is highly normalized and designed specifically for time-series data visualization, separating static device information from high-volume telemetry readings.

### Relational Schema Design
```sql
-- Devices (Nodes)
CREATE TABLE devices (
    device_id VARCHAR(50) PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL
);

-- Sensors (Attached to Nodes)
CREATE TABLE sensors (
    sensor_id VARCHAR(50) PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(device_id),
    sensor_name VARCHAR(255) NOT NULL
);

-- Readings (High-Volume Time-Series)
CREATE TABLE sensor_readings (
    reading_id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) REFERENCES sensors(sensor_id),
    value NUMERIC(10,4) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
