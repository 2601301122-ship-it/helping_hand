# FoodBridge 🌉🌱

> **"Rescue Food. Reduce Waste. Share Hope."**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-1A5336)](index.html)
[![Backend](https://img.shields.io/badge/Backend-Python%20Flask%20%7C%20SQLite-22C55E)](#run-the-flask-application)
[![UN SDGs](https://img.shields.io/badge/UN%20SDGs-SDG%202%20%7C%20SDG%2012-EAB308)](#sustainability--social-impact)

**FoodBridge** is an open-source surplus food coordination and waste reduction platform created for a college hackathon. It connects commercial food providers (restaurants, hotels, hostels, supermarkets, banquet halls) with verified charities, shelters, and community food pantries.

---

## 🍽️ The Problem & Our Solution

### The Problem
Commercial kitchens routinely prepare food for peak capacity. At the end of dinner services, wedding banquets, and retail shifts, large batches of safe, untouched, culinary-grade food are thrown into dumpsters due to a lack of immediate, verified pickup channels. Meanwhile, grassroots shelters struggle with food insecurity.

### The Solution
FoodBridge provides an organized, transparent surplus discovery platform where:
- **Donors** post surplus batches in seconds with mandatory storage specifications, preparation timestamps, and allergen disclosures.
- **Accredited NGOs** discover available food in their neighborhood and dispatch volunteers equipped with proper thermal transport (coolers, refrigerated vans).
- **Admins** audit food safety disclosures and verify NGO non-profit registrations.

> ⚠️ **Important:** FoodBridge is **NOT** a consumer food ordering or delivery application like UberEats or DoorDash. FoodBridge is a non-commercial community rescue and distribution tool focused exclusively on diverting landfill food waste.

---

## 🎨 Visual Identity & Design System

- **Forest Green (`#1A5336`)**: Trust, sustainability, and agricultural stewardship.
- **Vibrant Accent & Lime (`#22C55E`, `#84CC16`)**: Freshness, momentum, and ecological renewal.
- **Warm Cream & Soft Surfaces (`#FBF9F4`, `#F4EFE6`)**: Welcoming, dignified, and premium food-tech SaaS aesthetic.
- **Dark Mode Support**: Full light/dark theme toggle persisted across all pages.
- **Responsive Layout**: Designed for mobile phones, tablets, and desktop workstations.

---

## 📁 Project Structure

```
FoodBridge/
├── index.html              # Modern landing page with hero, stats ticker & featured feed
├── about.html              # Our mission, SDG 2/12 alignment, and Good Samaritan legal protections
├── how-it-works.html       # Step-by-step rescue lifecycle, comparison tables, and FAQs
├── browse.html             # Real-time searchable surplus food directory with multi-filters
├── donation-details.html   # Detailed food view, allergen chips, pickup countdown & request modal
├── login.html              # Server-backed account sign-in
├── register.html           # Dual registration for Food Donors vs Community NGOs
├── donor-dashboard.html    # Donor operations: create listings and manage collection requests
├── ngo-dashboard.html      # NGO portal: verification status, request tracker & feed
├── admin-dashboard.html    # Platform oversight: verification queue, audit table & canvas charts
├── profile.html            # User and organization settings with optional demo reset
├── contact.html            # Inquiry form, office details, and 24/7 Evening Surplus Hotline
├── css/
│   ├── variables.css       # Complete CSS design tokens, color palette, dark mode vars
│   ├── main.css            # Base stylesheet, typography, buttons, navbar & modals
│   ├── components.css      # Reusable UI cards, badges, timers, search bar & hero
│   └── dashboard.css       # Professional dashboard grids, sidebars, metrics & tables
├── js/
│   ├── data.js             # Realistic sample seed data for donations, NGOs & requests
│   ├── store.js            # Fetch client for the Flask JSON API
│   ├── auth.js             # Flask session authentication
│   ├── ui.js               # Toast alerts, modal controller, theme manager & SVG icons
│   ├── main.js             # Landing page dynamic stats counter and featured feed
│   ├── browse.js           # Search, category pills, city and dietary filtering logic
│   ├── details.js          # Single donation view & NGO collection request flow
│   ├── donor.js            # Donor listing creation/editing and request approval
│   ├── ngo.js              # NGO dashboard, request tracker & verification status
│   ├── ngo-capacity.js     # Active collection capacity tracking
│   ├── qr-verify.js        # Clearly labeled visual collection-token demo
│   ├── impact-calculator.js # Disclosed impact estimate assumptions
│   ├── notifications.js    # Local in-app notification drawer
│   ├── language.js         # English and Hindi landing-page strings
│   ├── admin.js            # Admin verification queue, listing moderation & canvas charts
│   └── profile.js          # Profile editing & demo state reset controller
├── assets/
│   └── logo.svg            # Custom FoodBridge brandmark
├── backend/
│   ├── app.py              # Flask API, SQLite persistence, sessions, and Ollama integration
│   └── test_app.py         # Backend API tests
├── requirements.txt        # Python dependencies
├── README.md               # Documentation & setup guide
├── LICENSE                 # MIT License
└── .gitignore              # Standard git exclusion rules
```

---

## 🚀 Run the Flask Application

The site and API are served from one Flask origin. Do not open the HTML files directly or use a separate static server: authentication cookies and API requests require the Flask origin.

From the project directory, create a virtual environment and install the dependencies:

```powershell
$python = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
if (-not (Test-Path $python)) { throw "Install Python 3.12 or update `$python to its executable path." }
& $python -m venv .venv
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Set a session secret and bootstrap the first administrator. The administrator password must contain at least 20 characters:

```powershell
$env:FOODBRIDGE_SECRET_KEY = [guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()
$env:FOODBRIDGE_ADMIN_EMAIL = "admin@example.org"
$env:FOODBRIDGE_ADMIN_PASSWORD = "replace-with-a-unique-20-character-password"
```

### Optional demo accounts

For local demonstrations only, set these variables before starting the server. The seeded administrator is available even if you omit the administrator bootstrap variables above:

```powershell
$env:FOODBRIDGE_SEED_DEMO = "1"
$env:FOODBRIDGE_DEMO_PASSWORD = "FoodBridge-Demo-2026!"
```

The demo password is shared by the sample donor, verified NGO, pending NGO, and sample administrator:

| Account | Email |
|---|---|
| Donor | `marcus@grandheritagehotel.com` |
| Verified NGO | `elena@hopeharborcommunity.org` |
| Pending NGO | `david@feedthelight.org` |
| Demo administrator | `admin@foodbridge.org` |

Seed data is inserted only into an empty database. `FOODBRIDGE_DEMO_PASSWORD` can be changed before initial seeding. The demo-reset action is disabled unless `FOODBRIDGE_SEED_DEMO=1`; do not use demo credentials in a deployed environment.

### Start the server

```powershell
& .\.venv\Scripts\python.exe -m backend.app
```

Open `http://127.0.0.1:5000`. The SQLite database is created under Flask's `instance` directory. The server binds to localhost by default.

### Ollama food suggestions

Install and start Ollama locally, then pull the requested model:

```powershell
ollama pull gemma4:e2b
```

FoodBridge calls `http://127.0.0.1:11434` using model tag `gemma4:e2b` by default. Configure `OLLAMA_URL`, `OLLAMA_MODEL`, or `OLLAMA_TIMEOUT` if needed. If Ollama or the model is unavailable, the donor form reports an error and remains usable without AI. Suggestions are donor-reviewed and never certify food as safe.

### Tests

```powershell
& .\.venv\Scripts\python.exe -m unittest backend.test_app
```

The test suite uses a temporary SQLite database and does not require Ollama.

---

## 🛡️ Food Safety & Responsible Donation Architecture

FoodBridge implements strict safety safeguards:
1. **Never Automatically Certifying Food Safe**: Software coordinates logistics; human teams certify physical condition.
2. **Thermal Storage Categorization**:
   - `Heated Warmer (>60°C)`
   - `Refrigerated Chiller (2°C - 4°C)`
   - `Ambient / Dry Storage`
   - `Frozen (-18°C)`
3. **Mandatory Allergen Disclosures**: Gluten, Dairy, Eggs, Tree Nuts, Soy, Fish/Shellfish, Sesame.
4. **Donor Privacy Protection**: Exact loading dock numbers and phone numbers are hidden from the public browse feed and only disclosed to the verified NGO upon donation acceptance.
5. **Good Samaritan Compliance**: Aligns with legal statutes that protect honest food businesses donating unserved food in good faith.

## 🔌 Flask API

The browser uses same-origin JSON requests through `js/store.js`. Mutating requests require a session CSRF token. Flask enforces authentication, roles, NGO verification, collection capacity, request state transitions, and private pickup-instruction access.

| HTTP method | Route | Access |
|---|---|---|
| `GET` | `/api/health`, `/api/metrics` | Public |
| `GET` | `/api/auth/csrf`, `/api/auth/me` | Session |
| `POST` | `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` | Public/session |
| `GET` | `/api/donations`, `/api/donations/<id>` | Public; private pickup details are filtered |
| `POST` | `/api/donations` | Donor |
| `PUT`, `DELETE` | `/api/donations/<id>` | Listing owner or admin |
| `GET` | `/api/requests` | Authenticated donor, NGO, or admin; results are scoped |
| `POST` | `/api/requests` | Verified NGO |
| `PATCH` | `/api/requests/<id>/status` | Donor, assigned NGO, or admin according to transition |
| `GET`, `PUT` | `/api/capacity` | NGO |
| `GET` | `/api/users`, `/api/users/<id>`, `/api/activities` | Admin |
| `PUT` | `/api/users/<id>` | Own profile or admin |
| `POST` | `/api/admin/verify-ngo/<id>`, `/api/admin/reset-demo` | Admin; demo reset requires demo mode |
| `POST` | `/api/ai/food-suggestion` | Donor; uses local Ollama |

## ⚠️ Scope and deployment notes

- Passwords are hashed; authentication uses server sessions, HttpOnly cookies, and CSRF checks. Set a long, unique `FOODBRIDGE_SECRET_KEY`; enable `FOODBRIDGE_COOKIE_SECURE=1` behind HTTPS.
- NGO accounts start pending and require administrator approval before requesting food. Exact pickup instructions are withheld until an approved request.
- QR patterns remain visual demo tokens; they do not cryptographically verify collection. Volunteer sign-up, password recovery, email verification, and image uploads are not backed by these APIs.
- AI output is a donor-reviewed suggestion only. It must not be used to certify food safety, determine allergens, or replace donor disclosures and in-person checks.
- Impact figures are estimates: meals use an assumption of 0.45 kg per meal, and CO₂ estimates are indicative rather than independently measured.

---

## 🌍 Sustainability & Social Impact

- **UN SDG 2 (Zero Hunger)**: Channeling surplus nutrition to shelters, youth programs, and soup kitchens.
- **UN SDG 12 (Responsible Consumption & Production)**: Cutting commercial food waste and greenhouse methane emissions.

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).
Created with pride for the college hackathon.
#   h e l p i n g _ h a n d  
 