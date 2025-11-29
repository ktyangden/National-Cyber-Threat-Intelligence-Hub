# 🛡️ National Cyber Threat Intelligence Hub

| **Project Title** | National Cyber Threat Intelligence Hub | 

***

## 🌟 Project Overview

The National Cyber Threat Intelligence Hub is a sophisticated software system designed to address the challenges posed by constantly evolving and highly evasive attack techniques in the modern cybersecurity landscape. The project focuses on creating a **centralized platform** for collecting, processing, and visualizing cyber threat data in **real-time**.

By integrating **real-time telemetry** from custom-deployed honeypots with **external threat intelligence feeds** and leveraging **Machine Learning (ML)** for advanced analytics, the hub transforms disparate data streams into **enriched, actionable intelligence** for security analysts. The architecture is cloud-native, ensuring high availability and scalability.

***

## 🎯 Objectives & Scope

The core objective is to architect and implement a system that demonstrates proficiency in real-time data streaming, advanced data processing, and secure system design.

| Category | Key Objectives |
| :--- | :--- |
| **Real-time Data Aggregation** | Implement continuous, fault-tolerant ingestion of attack logs from team-deployed **honeypots** and **external Threat Intelligence APIs** (e.g., AbuseIPDB, OTX). |
| **High-Throughput Processing** | Utilize **Apache Kafka** for scalable, high-speed data streaming and event processing to handle fluctuating traffic volumes. |
| **AI/ML Analytics** | Apply machine learning models for **anomaly detection** and **threat classification**, and implement **Natural Language Processing (NLP)** for intelligence summarization. |
| **Secure Visualization** | Develop an interactive, performance-driven **React-based dashboard** with **Google OAuth2** for restricted access to sensitive honeypot data. |

***

## ✨ Core Features

The system is compartmentalized into two primary functional modules based on data sensitivity and access control:

1.  **Honey Page Module (Restricted Access):**
    * Secured via **Google OAuth2** authentication (allowlist only).
    * Displays **real-time data** collected directly from deployed honeypots, including attacker IPs, Indicators of Compromise (IoCs), and attempted payloads.
    * Features an **attack heatmap** and real-time statistics on attack vectors.

2.  **External Threat Intelligence Module (Public Access):**
    * Accessible without authentication.
    * Aggregates and visualizes intelligence from **external APIs and feeds**.

| Feature Category | Description |
| :--- | :--- |
| **Data Ingestion** | Uses **Apache Kafka** for both `honeypot.events` and `external.ioc` streams. |
| **Authentication** | **Google OAuth2** for restricted access to the Honey Page. |
| **Backend API** | **Django REST Framework** provides versioned endpoints (`/api/v1/*`) for all dashboard components. |

***

## 🛠️ Technology Stack

The project utilizes a modern, cloud-native technology stack for resilience, performance, and scalability.

| Layer | Technology | Version / Framework | Role in Project |
| :--- | :--- | :--- | :--- |
| **Frontend (UI/UX)** | **React.js** | v19.0.0 | Interactive, data-driven dashboards using **Recharts** and **Tailwind CSS**. |
| **Backend (API)** | **Django REST Framework** | Python / DRF | Core RESTful API service for data retrieval and integration with ML models. |
| **Data Streaming** | **Apache Kafka** | N/A | High-throughput, low-latency message broker for real-time events. |
| **Database** | **MongoDB Atlas** | NoSQL | Flexible, cloud-hosted data storage for unstructured threat intelligence logs. |
| **DevOps** | **Docker, Kubernetes** | N/A | Containerization and orchestration for production environment deployment. |

***

## 🧑‍💻 Team Members

* **Kanishak Sharma** 
* **Karma Tshering Yangden** 
* **Mohit Khandal** 
* **Vishwas Kaushik** 
* **Rakshit Sawarn** 
* **Harshwardhan Saini** 