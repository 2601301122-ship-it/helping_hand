# FoodBridge

**Rescue food. Reduce waste. Share hope.**

FoodBridge connects food donors with verified community organisations. Donors publish surplus food listings, NGOs request collections, and administrators review NGO registrations.

## Features

- Searchable donations with pickup deadlines, storage details, and allergen disclosures.
- Server-backed accounts, role-based permissions, and NGO verification.
- Collection request and status workflows with NGO capacity checks.
- SQLite persistence and impact metrics.
- Optional donor-reviewed food category and description suggestions using local Ollama and `gemma4:e2b`.

## Run locally (Windows)

Use the Flask server to run both the website and API. Do not open the HTML files directly.

### 1. Install dependencies

Open PowerShell in the project folder:

```powershell
$python = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
if (-not (Test-Path $python)) { throw "Install Python 3.12, then update `$python to its path." }
& $python -m venv .venv
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 2. Start Ollama (optional AI suggestions)

Start the Ollama app. In another PowerShell window, check that the model is installed:

```powershell
ollama list
```

If `gemma4:e2b` is not listed, install it with:

```powershell
ollama pull gemma4:e2b
```

The backend connects to Ollama at `http://127.0.0.1:11434` by default. Keep Ollama running to use AI suggestions; the rest of the app works without it.

### 3. Start FoodBridge

In PowerShell, from the project folder:

```powershell
$env:FOODBRIDGE_SECRET_KEY = [guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()
$env:FOODBRIDGE_SEED_DEMO = "1"
$env:FOODBRIDGE_DEMO_PASSWORD = "FoodBridge-Demo-2026!"
& .\.venv\Scripts\python.exe -m backend.app
```

Keep this window open and visit **http://127.0.0.1:5000**. If you restart the server in a new PowerShell window, set the environment variables again before running it.

### Demo accounts

All demo accounts use the password **`FoodBridge-Demo-2026!`**:

| Role | Email |
|---|---|
| Donor | `marcus@grandheritagehotel.com` |
| Verified NGO | `elena@hopeharborcommunity.org` |
| Pending NGO | `david@feedthelight.org` |
| Administrator | `admin@foodbridge.org` |

Demo accounts are created only when `FOODBRIDGE_SEED_DEMO=1` and the database has no users. Do not use demo credentials outside local development.

## Run tests

```powershell
& .\.venv\Scripts\python.exe -m unittest backend.test_app
```

Tests use a temporary SQLite database and do not require Ollama.

## Backend configuration

| Variable | Default | Purpose |
|---|---|---|
| `FOODBRIDGE_SECRET_KEY` | Required | Signs session cookies. Use a unique random value. |
| `FOODBRIDGE_DATABASE` | `instance/foodbridge.sqlite3` | SQLite database location. |
| `FOODBRIDGE_SEED_DEMO` | Disabled | Set to `1` to seed local sample accounts and listings. |
| `FOODBRIDGE_DEMO_PASSWORD` | `FoodBridge-Demo-2026!` | Password assigned when demo accounts are first created. |
| `FOODBRIDGE_ADMIN_EMAIL` | Unset | Email for creating a non-demo administrator account. |
| `FOODBRIDGE_ADMIN_PASSWORD` | Unset | Initial administrator password; at least 20 characters. |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Local Ollama server URL. |
| `OLLAMA_MODEL` | `gemma4:e2b` | Ollama model tag used for suggestions. |
| `OLLAMA_TIMEOUT` | `90` seconds | AI request timeout. |

## API overview

The browser and API share the Flask origin. Mutating API requests require a session CSRF token.

| Area | Routes |
|---|---|
| Authentication | `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me` |
| Donations | `/api/donations`, `/api/donations/<id>` |
| Collection requests | `/api/requests`, `/api/requests/<id>/status` |
| NGO capacity | `/api/capacity` |
| Admin | `/api/users`, `/api/admin/verify-ngo/<id>`, `/api/admin/reset-demo` |
| Metrics and AI | `/api/metrics`, `/api/ai/food-suggestion` |

## Safety and deployment notes

- Passwords are hashed; authentication uses server sessions, HttpOnly cookies, and CSRF checks. Enable `FOODBRIDGE_COOKIE_SECURE=1` when serving over HTTPS.
- NGO accounts must be approved before requesting food. Exact pickup instructions are restricted and released only after donor approval.
- AI output is a suggestion for the donor to review. It does not determine allergens or certify that food is safe.
- QR patterns are visual demos, not secure handover verification. Volunteer registration, email verification, password recovery, and image uploads are not backed by the current API.
- Impact values are estimates, not independently measured results.

## Project layout

```text
backend/app.py       Flask API, SQLite storage, and Ollama integration
backend/test_app.py  Backend API tests
js/                  Frontend controllers and API client
css/                 Styles and themes
assets/              Images and branding
requirements.txt     Python dependencies
```

## License

This project is licensed under the [MIT License](LICENSE).
