# Galactic POS System

A complete, production-ready Point-of-Sale web application built with React, Node.js, Express, and MongoDB.

## Tech Stack
- **Frontend:** React 18, Vite, TailwindCSS, Lucide Icons (PWA ready)
- **Backend:** Node.js, Express, Mongoose, JWT Auth, bcrypt
- **Database:** MongoDB (auto-falls back to in-memory DB for zero-config dev)

## Quick Start

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env  # Edit values as needed
npm run dev
```
> Runs on `http://localhost:5001`. If MongoDB is unavailable, it uses an in-memory DB and auto-seeds test data.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
> Runs on `http://localhost:5173`.

## Test Accounts
| Role    | Email                    | Password    | Manager PIN |
|---------|--------------------------|-------------|-------------|
| Admin   | admin@galactic.pos       | password123 | 9999        |
| Manager | manager@galactic.pos     | password123 | 1234        |
| Cashier | jane@galactic.pos        | password123 | —           |

## Features
- 🔐 JWT Authentication & Role-Based Access Control (Admin, Manager, Cashier)
- 💰 Manager Price Override with PIN verification
- 📦 Inventory Management with audit log
- 📊 Admin Dashboard with sales metrics
- 🧾 80mm Thermal Receipt printing
- 📱 PWA — installable on mobile/tablet
- ⚡ Lazy-loaded React routes for fast initial load
- 🔍 Barcode Scanner support (USB/Bluetooth)
