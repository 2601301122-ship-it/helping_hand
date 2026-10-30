import hmac
import json
import os
import secrets
import sqlite3
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path

from flask import Flask, abort, g, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash


ROOT = Path(__file__).resolve().parent.parent
DONATION_CATEGORIES = [
    "Cooked Meals",
    "Bakery",
    "Fresh Produce",
    "Dairy & Packaged",
    "Beverages",
]
TERMINAL_REQUEST_STATES = {"Rejected", "Collected", "Completed"}


def utc_now():
    return datetime.now(timezone.utc)


def iso_now():
    return utc_now().isoformat()


def make_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def create_app(test_config=None):
    app = Flask(
        __name__,
        static_folder=None,
        instance_relative_config=True,
    )
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("FOODBRIDGE_SECRET_KEY"),
        DATABASE=os.environ.get(
            "FOODBRIDGE_DATABASE", str(Path(app.instance_path) / "foodbridge.sqlite3")
        ),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("FOODBRIDGE_COOKIE_SECURE") == "1",
        PERMANENT_SESSION_LIFETIME=timedelta(days=14),
        OLLAMA_URL=os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434"),
        OLLAMA_MODEL=os.environ.get("OLLAMA_MODEL", "gemma4:e2b"),
        OLLAMA_TIMEOUT=int(os.environ.get("OLLAMA_TIMEOUT", "90")),
        DEMO_MODE=os.environ.get("FOODBRIDGE_SEED_DEMO") == "1",
        DEMO_PASSWORD=os.environ.get(
            "FOODBRIDGE_DEMO_PASSWORD", "FoodBridge-Demo-2026!"
        ),
        ADMIN_EMAIL=os.environ.get("FOODBRIDGE_ADMIN_EMAIL"),
        ADMIN_PASSWORD=os.environ.get("FOODBRIDGE_ADMIN_PASSWORD"),
    )
    if test_config:
        app.config.update(test_config)
    if not app.config.get("SECRET_KEY"):
        if app.config.get("TESTING"):
            app.config["SECRET_KEY"] = "foodbridge-test-only-secret"
        else:
            raise RuntimeError(
                "Set FOODBRIDGE_SECRET_KEY to a long, random value before starting FoodBridge."
            )

    Path(app.instance_path).mkdir(parents=True, exist_ok=True)

    @app.before_request
    def enforce_api_request_safety():
        if not request.path.startswith("/api/") or request.method in {"GET", "HEAD", "OPTIONS"}:
            return None
        if not request.is_json:
            return api_error("Requests must use application/json.", 415)
        csrf_token = session.get("csrf_token")
        supplied_token = request.headers.get("X-CSRF-Token", "")
        if not csrf_token or not hmac.compare_digest(csrf_token, supplied_token):
            return api_error("Your session token is missing or expired. Refresh and retry.", 403)
        return None

    @app.after_request
    def attach_security_headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "same-origin")
        response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        return response

    @app.errorhandler(sqlite3.Error)
    def handle_database_error(error):
        app.logger.exception("Database operation failed", exc_info=error)
        return api_error("A database operation failed.", 500)

    @app.errorhandler(400)
    def handle_bad_request(error):
        return api_error(getattr(error, "description", "Invalid request."), 400)

    @app.teardown_appcontext
    def close_database(_error=None):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    def database():
        if "db" not in g:
            database_path = app.config["DATABASE"]
            if database_path != ":memory:":
                Path(database_path).parent.mkdir(parents=True, exist_ok=True)
            g.db = sqlite3.connect(database_path, timeout=15)
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA foreign_keys = ON")
            g.db.execute("PRAGMA busy_timeout = 15000")
        return g.db

    def initialize_database():
        db = database()
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('donor', 'ngo', 'admin')),
                profile_json TEXT NOT NULL,
                verified INTEGER NOT NULL DEFAULT 0,
                verification_status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS donations (
                id TEXT PRIMARY KEY,
                donor_id TEXT NOT NULL REFERENCES users(id),
                status TEXT NOT NULL,
                deadline TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS donations_status_deadline
                ON donations(status, deadline);
            CREATE INDEX IF NOT EXISTS donations_donor ON donations(donor_id);
            CREATE TABLE IF NOT EXISTS collection_requests (
                id TEXT PRIMARY KEY,
                donation_id TEXT NOT NULL REFERENCES donations(id),
                ngo_id TEXT NOT NULL REFERENCES users(id),
                status TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS requests_ngo_status
                ON collection_requests(ngo_id, status);
            CREATE INDEX IF NOT EXISTS requests_donation ON collection_requests(donation_id);
            CREATE TABLE IF NOT EXISTS ngo_capacity (
                ngo_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                max_kg REAL NOT NULL CHECK (max_kg > 0),
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS activity_log (
                id TEXT PRIMARY KEY,
                text TEXT NOT NULL,
                type TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        db.commit()
        if app.config["DEMO_MODE"]:
            seed_demo_data(db)

    def seed_demo_data(db):
        existing = db.execute("SELECT COUNT(*) AS count FROM users").fetchone()["count"]
        if existing:
            return
        password_hash = generate_password_hash(app.config["DEMO_PASSWORD"])
        demo_users = [
            (
                "usr_donor_1",
                "marcus@grandheritagehotel.com",
                "donor",
                "Chef Marcus Vance",
                "Grand Heritage Palace & Banquets",
                "Hotel & Banquet",
                "Metro Central",
                True,
                "verified",
                None,
            ),
            (
                "usr_ngo_1",
                "elena@hopeharborcommunity.org",
                "ngo",
                "Elena Rostova",
                "Hope Harbor Community Shelter",
                "Homeless Shelter & Soup Kitchen",
                "Metro Central",
                True,
                "verified",
                "NGO-REG-2022-8841",
            ),
            (
                "usr_ngo_2",
                "david@feedthelight.org",
                "ngo",
                "Brother David Kim",
                "Feed The Light Outreach",
                "Community Pantry",
                "Eastside Suburbs",
                False,
                "pending",
                "NGO-REG-2024-9102",
            ),
            (
                "usr_admin_1",
                "admin@foodbridge.org",
                "admin",
                "Alexandria Stone",
                "FoodBridge Platform Administration",
                "Platform Operations",
                "Headquarters",
                True,
                "verified",
                None,
            ),
        ]
        for (user_id, email, role, name, organization, org_type, city, verified,
             verification_status, reg_number) in demo_users:
            profile = {
                "id": user_id,
                "email": email,
                "role": role,
                "name": name,
                "organization": organization,
                "orgType": org_type,
                "city": city,
                "phone": "",
                "avatar": "".join(part[0] for part in name.split())[:2].upper(),
                "verified": verified,
                "verificationStatus": verification_status,
                "regNumber": reg_number,
                "servingCapacity": "450 meals/day" if role == "ngo" else None,
            }
            db.execute(
                """
                INSERT INTO users
                    (id, email, password_hash, role, profile_json, verified,
                     verification_status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    email,
                    password_hash,
                    role,
                    json.dumps(profile),
                    int(verified),
                    verification_status,
                    iso_now(),
                ),
            )
        db.execute(
            "INSERT INTO ngo_capacity (ngo_id, max_kg, updated_at) VALUES (?, ?, ?)",
            ("usr_ngo_1", 300, iso_now()),
        )
        now = utc_now()
        demo_donations = [
            {
                "id": "FB-DON-101",
                "title": "Surplus Banquet Gourmet Buffet: Roasted Chicken & Rice Pilaf",
                "description": "Unserved buffet food held in commercial hot warmers.",
                "category": "Cooked Meals",
                "quantity": 45,
                "unit": "Servings / Trays",
                "approxWeightKg": 28,
                "prepDateTime": (now - timedelta(hours=1)).isoformat(),
                "pickupDeadline": (now + timedelta(hours=6)).isoformat(),
                "storageCondition": "Heated Warmer (>60°C)",
                "allergens": ["Gluten", "Dairy"],
                "dietary": [],
                "donorId": "usr_donor_1",
                "donorName": "Grand Heritage Palace & Banquets",
                "donorType": "Hotel & Banquet",
                "city": "Metro Central",
                "generalLocation": "Metro Central Convention Corridor",
                "pickupInstructions": "Security Gate B, Service Loading Dock 3.",
                "image": "",
                "status": "Available",
                "createdAt": now.isoformat(),
            },
            {
                "id": "FB-DON-102",
                "title": "Fresh Artisan Sourdough, Baguettes & Pastries",
                "description": "Daily bakery surplus, individually bagged.",
                "category": "Bakery",
                "quantity": 60,
                "unit": "Items / Loaves",
                "approxWeightKg": 18,
                "prepDateTime": (now - timedelta(hours=3)).isoformat(),
                "pickupDeadline": (now + timedelta(hours=20)).isoformat(),
                "storageCondition": "Ambient / Dry Storage",
                "allergens": ["Gluten", "Eggs", "Dairy"],
                "dietary": ["Vegetarian"],
                "donorId": "usr_donor_1",
                "donorName": "Grand Heritage Palace & Banquets",
                "donorType": "Hotel & Banquet",
                "city": "Metro Central",
                "generalLocation": "Westside Market District",
                "pickupInstructions": "Rear alley entrance.",
                "image": "",
                "status": "Available",
                "createdAt": now.isoformat(),
            },
            {
                "id": "FB-DON-103",
                "title": "Fresh Organic Vegetable Crates",
                "description": "Seasonal produce for immediate distribution.",
                "category": "Fresh Produce",
                "quantity": 12,
                "unit": "Crates",
                "approxWeightKg": 80,
                "prepDateTime": (now - timedelta(hours=5)).isoformat(),
                "pickupDeadline": (now + timedelta(hours=12)).isoformat(),
                "storageCondition": "Refrigerated (2°C - 4°C)",
                "allergens": [],
                "dietary": ["Vegan"],
                "donorId": "usr_donor_1",
                "donorName": "Grand Heritage Palace & Banquets",
                "donorType": "Hotel & Banquet",
                "city": "Metro Central",
                "generalLocation": "North Park Logistics",
                "pickupInstructions": "Warehouse Bay 4.",
                "image": "",
                "status": "Requested",
                "requestedBy": "usr_ngo_1",
                "requestedOrg": "Hope Harbor Community Shelter",
                "createdAt": now.isoformat(),
            },
        ]
        for donation in demo_donations:
            db.execute(
                """
                INSERT INTO donations (id, donor_id, status, deadline, payload_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    donation["id"],
                    donation["donorId"],
                    donation["status"],
                    donation["pickupDeadline"],
                    json.dumps(donation),
                    donation["createdAt"],
                ),
            )
        request_payload = {
            "id": "REQ-901",
            "donationId": "FB-DON-103",
            "donationTitle": "Fresh Organic Vegetable Crates",
            "ngoId": "usr_ngo_1",
            "ngoName": "Hope Harbor Community Shelter",
            "ngoContact": "Elena Rostova",
            "servingEstimate": "Approx. 250 evening dinners",
            "vehicleType": "Insulated Van",
            "estimatedPickupTime": (now + timedelta(hours=4)).isoformat(),
            "notes": "Food-grade transport crates and refrigeration are ready.",
            "status": "Pending",
            "weightKg": 80,
            "createdAt": now.isoformat(),
        }
        db.execute(
            """
            INSERT INTO collection_requests
                (id, donation_id, ngo_id, status, payload_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                request_payload["id"],
                request_payload["donationId"],
                request_payload["ngoId"],
                request_payload["status"],
                json.dumps(request_payload),
                request_payload["createdAt"],
            ),
        )
        db.execute(
            "INSERT INTO activity_log (id, text, type, created_at) VALUES (?, ?, ?, ?)",
            (make_id("ACT"), "FoodBridge demo data initialized.", "general", iso_now()),
        )
        db.commit()

    def seed_configured_admin(db):
        email = app.config["ADMIN_EMAIL"]
        password = app.config["ADMIN_PASSWORD"]
        if bool(email) != bool(password):
            raise RuntimeError(
                "Set both FOODBRIDGE_ADMIN_EMAIL and FOODBRIDGE_ADMIN_PASSWORD to bootstrap an administrator."
            )
        if not email:
            return
        if len(password) < 20:
            raise RuntimeError("FOODBRIDGE_ADMIN_PASSWORD must contain at least 20 characters.")
        normalized_email = email.strip().lower()
        existing = db.execute(
            "SELECT id, role FROM users WHERE email = ?", (normalized_email,)
        ).fetchone()
        if existing:
            if existing["role"] != "admin":
                raise RuntimeError("FOODBRIDGE_ADMIN_EMAIL is already assigned to a non-admin account.")
            return
        user_id = make_id("ADM")
        name = "Platform Administrator"
        profile = {
            "id": user_id,
            "name": name,
            "email": normalized_email,
            "role": "admin",
            "organization": "FoodBridge Platform Administration",
            "orgType": "Platform Operations",
            "phone": "",
            "city": "Headquarters",
            "avatar": "FA",
            "verified": True,
            "verificationStatus": "verified",
            "regNumber": None,
            "servingCapacity": None,
        }
        db.execute(
            """
            INSERT INTO users
                (id, email, password_hash, role, profile_json, verified,
                 verification_status, created_at)
            VALUES (?, ?, ?, 'admin', ?, 1, 'verified', ?)
            """,
            (
                user_id,
                normalized_email,
                generate_password_hash(password),
                json.dumps(profile),
                iso_now(),
            ),
        )
        db.commit()

    def api_error(message, status):
        return jsonify({"error": message}), status

    def json_body():
        body = request.get_json()
        if not isinstance(body, dict):
            abort(400, description="A JSON object is required.")
        return body

    def current_user():
        user_id = session.get("user_id")
        if not user_id:
            return None
        row = database().execute(
            "SELECT id, email, role, profile_json FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if not row:
            session.clear()
            return None
        user = json.loads(row["profile_json"])
        user["id"] = row["id"]
        user["email"] = row["email"]
        user["role"] = row["role"]
        return user

    def require_roles(*roles):
        def decorator(function):
            @wraps(function)
            def wrapped(*args, **kwargs):
                user = current_user()
                if user is None:
                    return api_error("Sign in is required.", 401)
                if roles and user["role"] not in roles:
                    return api_error("You do not have permission to perform this action.", 403)
                g.current_user = user
                return function(*args, **kwargs)

            return wrapped

        return decorator

    def log_activity(text, activity_type="general"):
        database().execute(
            "INSERT INTO activity_log (id, text, type, created_at) VALUES (?, ?, ?, ?)",
            (make_id("ACT"), text, activity_type, iso_now()),
        )

    def expire_donations():
        db = database()
        now = iso_now()
        rows = db.execute(
            """
            SELECT id, payload_json FROM donations
            WHERE status IN ('Available', 'Requested') AND deadline <= ?
            """,
            (now,),
        ).fetchall()
        if not rows:
            return
        for row in rows:
            payload = json.loads(row["payload_json"])
            payload["status"] = "Expired"
            payload["expiredAt"] = now
            db.execute(
                "UPDATE donations SET status = 'Expired', payload_json = ? WHERE id = ?",
                (json.dumps(payload), row["id"]),
            )
            db.execute(
                """
                UPDATE collection_requests
                SET status = 'Rejected',
                    payload_json = json_set(payload_json, '$.status', 'Rejected',
                        '$.statusNote', 'Collection deadline passed before donor approval.')
                WHERE donation_id = ? AND status = 'Pending'
                """,
                (row["id"],),
            )
            log_activity(f'Donation "{payload.get("title", row["id"])}" expired.', "expiry")
        db.commit()

    def donation_from_row(row):
        return json.loads(row["payload_json"])

    def donation_visible_to_user(donation, user):
        if user is None:
            return False
        if user["role"] == "admin" or donation["donorId"] == user["id"]:
            return True
        if user["role"] != "ngo" or not user.get("verified"):
            return False
        return bool(
            database().execute(
                """
                SELECT 1 FROM collection_requests
                WHERE donation_id = ? AND ngo_id = ? AND status IN ('Accepted', 'Collected', 'Completed')
                """,
                (donation["id"], user["id"]),
            ).fetchone()
        )

    def public_donation(donation, user):
        result = dict(donation)
        if not donation_visible_to_user(donation, user):
            result.pop("pickupInstructions", None)
            result.pop("donorPhone", None)
        return result

    def capacity_for(ngo_id):
        db = database()
        row = db.execute(
            "SELECT max_kg FROM ngo_capacity WHERE ngo_id = ?", (ngo_id,)
        ).fetchone()
        max_kg = float(row["max_kg"]) if row else 300.0
        committed = db.execute(
            """
            SELECT COALESCE(SUM(CAST(json_extract(r.payload_json, '$.weightKg') AS REAL)), 0) AS kg,
                   COUNT(*) AS count
            FROM collection_requests r
            JOIN donations d ON d.id = r.donation_id
            WHERE r.ngo_id = ? AND r.status IN ('Pending', 'Accepted')
            """,
            (ngo_id,),
        ).fetchone()
        committed_kg = float(committed["kg"] or 0)
        return {
            "maxKg": max_kg,
            "committedKg": committed_kg,
            "remainingKg": max(0.0, max_kg - committed_kg),
            "activeRequests": int(committed["count"]),
        }

    @app.get("/api/health")
    def health():
        database().execute("SELECT 1").fetchone()
        return jsonify(
            {
                "status": "ok",
                "aiModel": app.config["OLLAMA_MODEL"],
                "demoMode": app.config["DEMO_MODE"],
            }
        )

    @app.get("/api/auth/csrf")
    def csrf_token():
        token = session.get("csrf_token")
        if not token:
            token = secrets.token_urlsafe(32)
            session["csrf_token"] = token
        return jsonify({"csrf_token": token})

    @app.get("/api/auth/me")
    def auth_me():
        user = current_user()
        return jsonify({"user": user})

    @app.post("/api/auth/login")
    def auth_login():
        body = json_body()
        email = str(body.get("email", "")).strip().lower()
        password = body.get("password", "")
        if not email or not isinstance(password, str):
            return api_error("Email and password are required.", 400)
        row = database().execute(
            "SELECT id, password_hash FROM users WHERE email = ?", (email,)
        ).fetchone()
        if not row or not check_password_hash(row["password_hash"], password):
            return api_error("Email or password is incorrect.", 401)
        session.clear()
        session.permanent = bool(body.get("remember", True))
        session["user_id"] = row["id"]
        session["csrf_token"] = secrets.token_urlsafe(32)
        return jsonify({"user": current_user(), "csrf_token": session["csrf_token"]})

    @app.post("/api/auth/register")
    def auth_register():
        body = json_body()
        name = str(body.get("name", "")).strip()
        email = str(body.get("email", "")).strip().lower()
        password = body.get("password", "")
        role = body.get("role")
        organization = str(body.get("organization", "")).strip()
        if role not in {"donor", "ngo"}:
            return api_error("Role must be donor or ngo.", 400)
        if not name or not organization or not email or "@" not in email:
            return api_error("Name, valid email, and organization are required.", 400)
        if not isinstance(password, str) or len(password) < 12:
            return api_error("Password must contain at least 12 characters.", 400)
        user_id = make_id("USR")
        verified = role == "donor"
        profile = {
            "id": user_id,
            "name": name,
            "email": email,
            "role": role,
            "organization": organization,
            "orgType": str(body.get("orgType", "")).strip(),
            "phone": str(body.get("phone", "")).strip(),
            "city": str(body.get("city", "")).strip(),
            "avatar": "".join(part[0] for part in name.split())[:2].upper(),
            "verified": verified,
            "verificationStatus": "verified" if verified else "pending",
            "regNumber": str(body.get("regNumber", "")).strip() or None,
            "servingCapacity": str(body.get("servingCapacity", "")).strip() or None,
            "submittedAt": iso_now(),
        }
        db = database()
        try:
            db.execute(
                """
                INSERT INTO users
                    (id, email, password_hash, role, profile_json, verified,
                     verification_status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    email,
                    generate_password_hash(password),
                    role,
                    json.dumps(profile),
                    int(verified),
                    profile["verificationStatus"],
                    iso_now(),
                ),
            )
            if role == "ngo":
                db.execute(
                    "INSERT INTO ngo_capacity (ngo_id, max_kg, updated_at) VALUES (?, ?, ?)",
                    (user_id, 300, iso_now()),
                )
            log_activity(f"New {role} account registered: {organization}.", "general")
            db.commit()
        except sqlite3.IntegrityError:
            db.rollback()
            return api_error("An account with this email already exists.", 409)
        session.clear()
        session.permanent = True
        session["user_id"] = user_id
        session["csrf_token"] = secrets.token_urlsafe(32)
        return jsonify({"user": profile, "csrf_token": session["csrf_token"]}), 201

    @app.post("/api/auth/logout")
    def auth_logout():
        session.clear()
        return jsonify({"ok": True})

    @app.get("/api/donations")
    def list_donations():
        expire_donations()
        user = current_user()
        query = str(request.args.get("query", "")).strip().casefold()
        category = request.args.get("category", "all")
        status = request.args.get("status", "all")
        city = request.args.get("city", "all")
        rows = database().execute("SELECT * FROM donations ORDER BY created_at DESC").fetchall()
        donations = [donation_from_row(row) for row in rows]
        if category and category.casefold() != "all":
            donations = [d for d in donations if d.get("category", "").casefold() == category.casefold()]
        if status and status.casefold() != "all":
            donations = [d for d in donations if d.get("status", "").casefold() == status.casefold()]
        if city and city.casefold() != "all":
            donations = [d for d in donations if d.get("city", "").casefold() == city.casefold()]
        if request.args.get("donorId") and user and (
            user["role"] == "admin" or request.args["donorId"] == user["id"]
        ):
            donations = [d for d in donations if d.get("donorId") == request.args["donorId"]]
        if query:
            donations = [
                d for d in donations
                if query in " ".join(
                    str(d.get(field, ""))
                    for field in ("title", "description", "donorName", "generalLocation")
                ).casefold()
            ]
        return jsonify([public_donation(item, user) for item in donations])

    @app.get("/api/donations/<donation_id>")
    def donation_details(donation_id):
        expire_donations()
        row = database().execute(
            "SELECT * FROM donations WHERE id = ?", (donation_id,)
        ).fetchone()
        if row is None:
            return api_error("Donation not found.", 404)
        return jsonify(public_donation(donation_from_row(row), current_user()))

    @app.post("/api/donations")
    @require_roles("donor")
    def create_donation():
        body = json_body()
        title = str(body.get("title", "")).strip()
        if len(title) > 160:
            return api_error("Donation titles must be 160 characters or fewer.", 400)
        deadline = str(body.get("pickupDeadline", ""))
        try:
            deadline_dt = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
            if deadline_dt.tzinfo is None:
                deadline_dt = deadline_dt.replace(tzinfo=timezone.utc)
        except ValueError:
            return api_error("A valid collection deadline is required.", 400)
        if deadline_dt <= utc_now():
            return api_error("The collection deadline must be in the future.", 400)
        try:
            quantity = float(body.get("quantity", 0))
            weight = float(body.get("approxWeightKg", 0))
        except (TypeError, ValueError):
            return api_error("Quantity and weight must be numeric.", 400)
        if not title or quantity <= 0 or weight <= 0:
            return api_error("Title, positive quantity, and positive weight are required.", 400)
        if body.get("category") not in DONATION_CATEGORIES:
            return api_error("Choose a supported donation category.", 400)
        user = g.current_user
        allowed_fields = {
            "title", "description", "category", "quantity", "unit", "approxWeightKg",
            "prepDateTime", "pickupDeadline", "storageCondition", "allergens",
            "dietary", "generalLocation", "pickupInstructions", "image",
        }
        donation = {
            **{key: body[key] for key in allowed_fields if key in body},
            "id": make_id("FB-DON"),
            "title": title,
            "quantity": quantity,
            "approxWeightKg": weight,
            "pickupDeadline": deadline_dt.astimezone(timezone.utc).isoformat(),
            "donorId": user["id"],
            "donorName": user.get("organization") or user["name"],
            "donorType": user.get("orgType", ""),
            "city": user.get("city", ""),
            "status": "Available",
            "createdAt": iso_now(),
        }
        donation.pop("acceptedNgoId", None)
        donation.pop("requestedBy", None)
        db = database()
        db.execute(
            """
            INSERT INTO donations (id, donor_id, status, deadline, payload_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                donation["id"],
                user["id"],
                "Available",
                donation["pickupDeadline"],
                json.dumps(donation),
                donation["createdAt"],
            ),
        )
        log_activity(f'{donation["donorName"]} published "{title}".', "donation")
        db.commit()
        return jsonify(donation), 201

    @app.put("/api/donations/<donation_id>")
    @require_roles("donor", "admin")
    def update_donation(donation_id):
        body = json_body()
        db = database()
        row = db.execute("SELECT * FROM donations WHERE id = ?", (donation_id,)).fetchone()
        if row is None:
            return api_error("Donation not found.", 404)
        donation = donation_from_row(row)
        user = g.current_user
        if user["role"] != "admin" and donation["donorId"] != user["id"]:
            return api_error("You may only update your own donation listings.", 403)
        if user["role"] != "admin" and donation["status"] != "Available":
            return api_error("Only available listings can be edited.", 409)
        allowed = {
            "title", "description", "category", "quantity", "unit", "approxWeightKg",
            "prepDateTime", "pickupDeadline", "storageCondition", "allergens",
            "dietary", "generalLocation", "pickupInstructions", "image",
        }
        donation.update({key: value for key, value in body.items() if key in allowed})
        if not str(donation.get("title", "")).strip() or len(str(donation["title"])) > 160:
            return api_error("Enter a donation title of 160 characters or fewer.", 400)
        if donation.get("category") not in DONATION_CATEGORIES:
            return api_error("Choose a supported donation category.", 400)
        try:
            deadline = datetime.fromisoformat(
                str(donation["pickupDeadline"]).replace("Z", "+00:00")
            )
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            quantity = float(donation["quantity"])
            weight = float(donation["approxWeightKg"])
        except (KeyError, ValueError, TypeError):
            return api_error("Valid quantity, weight, and collection deadline are required.", 400)
        if deadline <= utc_now() or quantity <= 0 or weight <= 0:
            return api_error("A future deadline and positive quantity and weight are required.", 400)
        donation["pickupDeadline"] = deadline.astimezone(timezone.utc).isoformat()
        donation["updatedAt"] = iso_now()
        db.execute(
            """
            UPDATE donations SET status = ?, deadline = ?, payload_json = ? WHERE id = ?
            """,
            (donation["status"], donation["pickupDeadline"], json.dumps(donation), donation_id),
        )
        log_activity(f'{donation.get("donorName", "Donor")} updated "{donation["title"]}".', "donation")
        db.commit()
        return jsonify(donation)

    @app.delete("/api/donations/<donation_id>")
    @require_roles("donor", "admin")
    def delete_donation(donation_id):
        db = database()
        row = db.execute("SELECT * FROM donations WHERE id = ?", (donation_id,)).fetchone()
        if row is None:
            return api_error("Donation not found.", 404)
        donation = donation_from_row(row)
        user = g.current_user
        if user["role"] != "admin" and donation["donorId"] != user["id"]:
            return api_error("You may only withdraw your own listings.", 403)
        if user["role"] != "admin" and donation["status"] != "Available":
            return api_error("Only available listings can be withdrawn.", 409)
        db.execute("DELETE FROM collection_requests WHERE donation_id = ?", (donation_id,))
        db.execute("DELETE FROM donations WHERE id = ?", (donation_id,))
        log_activity(f'Donation listing "{donation["title"]}" was withdrawn.', "donation")
        db.commit()
        return jsonify({"success": True})

    @app.get("/api/requests")
    @require_roles("donor", "ngo", "admin")
    def list_requests():
        expire_donations()
        user = g.current_user
        db = database()
        if user["role"] == "admin":
            rows = db.execute(
                "SELECT payload_json FROM collection_requests ORDER BY created_at DESC"
            ).fetchall()
        elif user["role"] == "ngo":
            rows = db.execute(
                """
                SELECT payload_json FROM collection_requests
                WHERE ngo_id = ? ORDER BY created_at DESC
                """,
                (user["id"],),
            ).fetchall()
        else:
            rows = db.execute(
                """
                SELECT r.payload_json FROM collection_requests r
                JOIN donations d ON d.id = r.donation_id
                WHERE d.donor_id = ? ORDER BY r.created_at DESC
                """,
                (user["id"],),
            ).fetchall()
        results = [json.loads(row["payload_json"]) for row in rows]
        if request.args.get("ngoId") and user["role"] in {"ngo", "admin"}:
            results = [item for item in results if item["ngoId"] == request.args["ngoId"]]
        if request.args.get("donationId"):
            results = [
                item for item in results if item["donationId"] == request.args["donationId"]
            ]
        if request.args.get("status"):
            wanted = request.args["status"].casefold()
            results = [item for item in results if item["status"].casefold() == wanted]
        return jsonify(results)

    @app.post("/api/requests")
    @require_roles("ngo")
    def create_request():
        user = g.current_user
        if not user.get("verified"):
            return api_error("Organisation verification is required to request food.", 403)
        body = json_body()
        donation_id = str(body.get("donationId", ""))
        serving_estimate = str(body.get("servingEstimate", "")).strip()
        vehicle_type = str(body.get("vehicleType", "")).strip()
        pickup_time = str(body.get("estimatedPickupTime", "")).strip()
        try:
            pickup_datetime = datetime.fromisoformat(pickup_time.replace("Z", "+00:00"))
            if pickup_datetime.tzinfo is None:
                pickup_datetime = pickup_datetime.replace(tzinfo=timezone.utc)
        except ValueError:
            return api_error("A valid estimated pickup time is required.", 400)
        if pickup_datetime <= utc_now():
            return api_error("Estimated pickup time must be in the future.", 400)
        expire_donations()
        db = database()
        db.execute("BEGIN IMMEDIATE")
        verification = db.execute(
            "SELECT verified FROM users WHERE id = ?", (user["id"],)
        ).fetchone()
        if not verification or not verification["verified"]:
            db.rollback()
            return api_error("Organisation verification is required to request food.", 403)
        row = db.execute("SELECT * FROM donations WHERE id = ?", (donation_id,)).fetchone()
        if row is None:
            db.rollback()
            return api_error("Donation not found.", 404)
        donation = donation_from_row(row)
        if donation["status"] != "Available":
            db.rollback()
            return api_error("This donation is no longer available.", 409)
        deadline = datetime.fromisoformat(
            donation["pickupDeadline"].replace("Z", "+00:00")
        )
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        if pickup_datetime > deadline:
            db.rollback()
            return api_error("Estimated pickup time must be before the collection deadline.", 400)
        weight = float(donation.get("approxWeightKg") or 0)
        capacity = capacity_for(user["id"])
        if weight <= 0 or weight > capacity["remainingKg"]:
            db.rollback()
            return api_error(
                f'This request exceeds remaining collection capacity ({capacity["remainingKg"]} kg).',
                409,
            )
        request_id = make_id("REQ")
        payload = {
            "id": request_id,
            "donationId": donation_id,
            "donationTitle": donation["title"],
            "ngoId": user["id"],
            "ngoName": user.get("organization") or user["name"],
            "ngoContact": user["name"],
            "servingEstimate": serving_estimate,
            "vehicleType": vehicle_type,
            "estimatedPickupTime": pickup_datetime.astimezone(timezone.utc).isoformat(),
            "notes": str(body.get("notes", "")).strip(),
            "status": "Pending",
            "weightKg": weight,
            "createdAt": iso_now(),
        }
        if not payload["servingEstimate"] or not payload["vehicleType"]:
            db.rollback()
            return api_error("Beneficiary estimate, transport, and pickup time are required.", 400)
        db.execute(
            """
            INSERT INTO collection_requests
                (id, donation_id, ngo_id, status, payload_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (request_id, donation_id, user["id"], "Pending", json.dumps(payload), payload["createdAt"]),
        )
        donation["status"] = "Requested"
        donation["requestedBy"] = user["id"]
        donation["requestedOrg"] = payload["ngoName"]
        db.execute(
            """
            UPDATE donations SET status = 'Requested', payload_json = ? WHERE id = ?
            """,
            (json.dumps(donation), donation_id),
        )
        log_activity(f'{payload["ngoName"]} requested "{donation["title"]}".', "request")
        db.commit()
        return jsonify(payload), 201

    @app.patch("/api/requests/<request_id>/status")
    @require_roles("donor", "ngo", "admin")
    def update_request_status(request_id):
        body = json_body()
        new_status = body.get("status")
        allowed_previous = {
            "Accepted": {"Pending"},
            "Rejected": {"Pending"},
            "Collected": {"Accepted"},
            "Completed": {"Collected"},
        }
        if new_status not in allowed_previous:
            return api_error("Unsupported collection request status.", 400)
        if new_status == "Accepted":
            expire_donations()
        db = database()
        db.execute("BEGIN IMMEDIATE")
        row = db.execute(
            "SELECT * FROM collection_requests WHERE id = ?", (request_id,)
        ).fetchone()
        if row is None:
            db.rollback()
            return api_error("Collection request not found.", 404)
        payload = json.loads(row["payload_json"])
        user = g.current_user
        donation_row = db.execute(
            "SELECT * FROM donations WHERE id = ?", (payload["donationId"],)
        ).fetchone()
        donation = donation_from_row(donation_row) if donation_row else None
        donor_action = new_status in {"Accepted", "Rejected"}
        can_update = (
            user["role"] == "admin"
            or (donor_action and donation and donation["donorId"] == user["id"])
            or (not donor_action and user["role"] == "ngo" and payload["ngoId"] == user["id"])
        )
        if not can_update:
            db.rollback()
            return api_error("You are not allowed to update this collection request.", 403)
        if payload["status"] not in allowed_previous[new_status]:
            db.rollback()
            return api_error(
                f'Cannot change a {payload["status"]} request to {new_status}.', 409
            )
        if donation is None:
            db.rollback()
            return api_error("The linked donation no longer exists.", 404)
        if new_status == "Accepted":
            ngo_row = db.execute(
                "SELECT verified FROM users WHERE id = ?", (payload["ngoId"],)
            ).fetchone()
            if not ngo_row or not ngo_row["verified"]:
                db.rollback()
                return api_error("Only verified organisations can have requests accepted.", 403)
            if not donation or donation["status"] != "Requested":
                db.rollback()
                return api_error("This donation is no longer available for approval.", 409)
        payload["status"] = new_status
        payload["statusNote"] = str(body.get("notes", "")).strip()
        db.execute(
            """
            UPDATE collection_requests SET status = ?, payload_json = ? WHERE id = ?
            """,
            (new_status, json.dumps(payload), request_id),
        )
        if new_status == "Accepted":
            donation.update(
                {
                    "status": "Accepted",
                    "acceptedNgoId": payload["ngoId"],
                    "acceptedNgoName": payload["ngoName"],
                }
            )
        elif new_status == "Rejected":
            donation.update(
                {
                    "status": "Available",
                    "requestedBy": None,
                    "requestedOrg": None,
                }
            )
        elif new_status == "Collected":
            donation.update(
                {
                    "status": "Collected",
                    "collectedBy": payload["ngoId"],
                    "collectedAt": iso_now(),
                }
            )
        elif new_status == "Completed":
            donation.update({"status": "Completed", "completedAt": iso_now()})
        db.execute(
            "UPDATE donations SET status = ?, payload_json = ? WHERE id = ?",
            (donation["status"], json.dumps(donation), donation["id"]),
        )
        log_activity(
            f'Request {request_id} changed to {new_status}.',
            "pickup" if new_status in {"Collected", "Completed"} else "request",
        )
        db.commit()
        return jsonify(payload)

    @app.get("/api/capacity")
    @require_roles("ngo")
    def get_capacity():
        return jsonify(capacity_for(g.current_user["id"]))

    @app.put("/api/capacity")
    @require_roles("ngo")
    def set_capacity():
        body = json_body()
        try:
            max_kg = float(body.get("maxKg"))
        except (TypeError, ValueError):
            return api_error("Maximum capacity must be a positive number.", 400)
        if max_kg <= 0:
            return api_error("Maximum capacity must be a positive number.", 400)
        db = database()
        db.execute("BEGIN IMMEDIATE")
        committed = capacity_for(g.current_user["id"])["committedKg"]
        if max_kg < committed:
            db.rollback()
            return api_error(
                f"Capacity cannot be lower than {committed:g} kg already committed.", 409
            )
        db.execute(
            """
            INSERT INTO ngo_capacity (ngo_id, max_kg, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(ngo_id) DO UPDATE SET max_kg = excluded.max_kg,
                updated_at = excluded.updated_at
            """,
            (g.current_user["id"], max_kg, iso_now()),
        )
        db.commit()
        return jsonify(capacity_for(g.current_user["id"]))

    @app.get("/api/users")
    @require_roles("admin")
    def list_users():
        role = request.args.get("role")
        rows = database().execute("SELECT profile_json FROM users ORDER BY created_at").fetchall()
        users = [json.loads(row["profile_json"]) for row in rows]
        if role:
            users = [user for user in users if user["role"] == role]
        return jsonify(users)

    @app.get("/api/users/<user_id>")
    @require_roles("admin")
    def get_user(user_id):
        row = database().execute(
            "SELECT profile_json FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if row is None:
            return api_error("User not found.", 404)
        return jsonify(json.loads(row["profile_json"]))

    @app.put("/api/users/<user_id>")
    @require_roles("admin", "donor", "ngo")
    def update_user(user_id):
        user = g.current_user
        if user["role"] != "admin" and user_id != user["id"]:
            return api_error("You may only update your own profile.", 403)
        body = json_body()
        db = database()
        row = db.execute(
            "SELECT profile_json FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if row is None:
            return api_error("User not found.", 404)
        profile = json.loads(row["profile_json"])
        for key in ("name", "phone", "organization", "orgType", "city", "regNumber", "servingCapacity"):
            if key in body:
                profile[key] = str(body[key]).strip()
        db.execute(
            "UPDATE users SET profile_json = ? WHERE id = ?",
            (json.dumps(profile), user_id),
        )
        db.commit()
        return jsonify(profile)

    @app.post("/api/admin/verify-ngo/<user_id>")
    @require_roles("admin")
    def verify_ngo(user_id):
        body = json_body()
        approved = body.get("approve")
        if not isinstance(approved, bool):
            return api_error("The approve field must be true or false.", 400)
        db = database()
        row = db.execute(
            "SELECT role, profile_json FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if row is None or row["role"] != "ngo":
            return api_error("Community organisation not found.", 404)
        profile = json.loads(row["profile_json"])
        profile["verified"] = approved
        profile["verificationStatus"] = "verified" if approved else "rejected"
        if approved:
            profile["verificationDate"] = utc_now().date().isoformat()
        db.execute(
            """
            UPDATE users SET verified = ?, verification_status = ?, profile_json = ?
            WHERE id = ?
            """,
            (int(approved), profile["verificationStatus"], json.dumps(profile), user_id),
        )
        log_activity(
            f'Admin {"approved" if approved else "rejected"} {profile.get("organization", user_id)}.',
            "verification",
        )
        db.commit()
        return jsonify(profile)

    @app.get("/api/metrics")
    def metrics():
        expire_donations()
        db = database()
        donations = db.execute(
            "SELECT status, payload_json FROM donations"
        ).fetchall()
        users = db.execute("SELECT role, verified, verification_status FROM users").fetchall()
        requests = db.execute(
            "SELECT status FROM collection_requests"
        ).fetchall()
        total_weight = sum(
            float(json.loads(row["payload_json"]).get("approxWeightKg") or 0)
            for row in donations
        )
        rescued_weight = sum(
            float(json.loads(row["payload_json"]).get("approxWeightKg") or 0)
            for row in donations
            if row["status"] in {"Collected", "Completed"}
        )
        donors = [row for row in users if row["role"] == "donor"]
        ngos = [row for row in users if row["role"] == "ngo"]
        pending_ngo = [
            row for row in ngos
            if not row["verified"] and row["verification_status"] == "pending"
        ]
        return jsonify(
            {
                "totalUsers": len(users),
                "totalDonors": len(donors),
                "totalNgos": len(ngos),
                "totalDonations": len(donations),
                "activeDonations": sum(row["status"] == "Available" for row in donations),
                "collectedDonations": sum(row["status"] == "Collected" for row in donations),
                "completedDonations": sum(row["status"] == "Completed" for row in donations),
                "pendingRequests": sum(row["status"] == "Pending" for row in requests),
                "pendingVerificationsCount": len(pending_ngo),
                "totalWeightKg": total_weight,
                "rescuedWeightKg": rescued_weight,
                "estimatedMeals": round(rescued_weight / 0.45),
                "co2SavedKg": round(rescued_weight * 2.5),
                "demoMode": app.config["DEMO_MODE"],
            }
        )

    @app.get("/api/activities")
    @require_roles("admin")
    def activities():
        rows = database().execute(
            "SELECT id, text, type, created_at FROM activity_log ORDER BY created_at DESC LIMIT 50"
        ).fetchall()
        return jsonify(
            [
                {
                    "id": row["id"],
                    "text": row["text"],
                    "type": row["type"],
                    "time": row["created_at"],
                }
                for row in rows
            ]
        )

    @app.post("/api/admin/reset-demo")
    @require_roles("admin")
    def reset_demo():
        if not app.config["DEMO_MODE"]:
            return api_error("Demo reset is disabled unless demo mode is enabled.", 403)
        db = database()
        for table in (
            "collection_requests",
            "donations",
            "ngo_capacity",
            "activity_log",
            "users",
        ):
            db.execute(f"DELETE FROM {table}")
        db.commit()
        seed_demo_data(db)
        seed_configured_admin(db)
        return jsonify({"success": True})

    @app.post("/api/ai/food-suggestion")
    @require_roles("donor")
    def food_suggestion():
        body = json_body()
        title = str(body.get("title", "")).strip()
        description = str(body.get("description", "")).strip()
        if not title:
            return api_error("Enter a food name before requesting suggestions.", 400)
        schema = {
            "type": "object",
            "properties": {
                "category": {"type": "string", "enum": DONATION_CATEGORIES},
                "description": {"type": "string"},
            },
            "required": ["category", "description"],
        }
        prompt = (
            "Suggest a category and concise factual listing description for a surplus-food "
            "donation. Do not infer ingredients, allergens, storage, preparation, or safety. "
            "Do not certify that food is safe. Use only the supplied facts. If facts are "
            "missing, explicitly ask the donor to provide them. Category and description "
            "must be completed and reviewed by the donor. Return only the requested JSON.\n"
            f"Food name: {title}\nDonor notes: {description}"
        )
        request_body = json.dumps(
            {
                "model": app.config["OLLAMA_MODEL"],
                "prompt": prompt,
                "stream": False,
                "format": schema,
            }
        ).encode("utf-8")
        ollama_request = urllib.request.Request(
            app.config["OLLAMA_URL"].rstrip("/") + "/api/generate",
            data=request_body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(
                ollama_request, timeout=app.config["OLLAMA_TIMEOUT"]
            ) as response:
                ollama_result = json.loads(response.read().decode("utf-8"))
                if ollama_result.get("error"):
                    return api_error(
                        f'Ollama could not load model "{app.config["OLLAMA_MODEL"]}". Pull the model and retry.',
                        503,
                    )
                suggestion = json.loads(ollama_result.get("response", ""))
        except urllib.error.HTTPError as error:
            app.logger.exception("Ollama returned an HTTP error", exc_info=error)
            if error.code == 404:
                return api_error(
                    f'Ollama model "{app.config["OLLAMA_MODEL"]}" is unavailable. Pull the model and retry.',
                    503,
                )
            return api_error("Ollama could not generate a suggestion.", 502)
        except (urllib.error.URLError, TimeoutError, OSError):
            app.logger.exception("Could not connect to Ollama")
            return api_error(
                "Could not connect to Ollama. Start the local Ollama service and retry.",
                503,
            )
        except (json.JSONDecodeError, TypeError, AttributeError):
            app.logger.exception("Ollama returned an invalid suggestion")
            return api_error("Ollama returned an invalid suggestion. Retry or enter details manually.", 502)
        if (
            not isinstance(suggestion, dict)
            or suggestion.get("category") not in DONATION_CATEGORIES
            or not isinstance(suggestion.get("description"), str)
            or not suggestion["description"].strip()
        ):
            return api_error("Ollama returned an incomplete suggestion. Retry or enter details manually.", 502)
        return jsonify(
            {
                "category": suggestion["category"],
                "description": suggestion["description"].strip()[:2000],
                "model": app.config["OLLAMA_MODEL"],
                "notice": "AI suggestions may be inaccurate. Review and confirm all details; AI does not assess food safety.",
            }
        )

    @app.get("/")
    def home():
        return send_from_directory(ROOT, "index.html")

    @app.get("/<path:filename>")
    def frontend_file(filename):
        parts = Path(filename).parts
        if len(parts) == 1 and Path(filename).suffix.lower() == ".html":
            return send_from_directory(ROOT, filename)
        if len(parts) > 1 and parts[0] in {"css", "js", "assets"}:
            return send_from_directory(ROOT / parts[0], str(Path(*parts[1:])))
        abort(404)

    with app.app_context():
        initialize_database()
        seed_configured_admin(database())
    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host=os.environ.get("FOODBRIDGE_HOST", "127.0.0.1"),
        port=int(os.environ.get("FOODBRIDGE_PORT", "5000")),
        debug=os.environ.get("FOODBRIDGE_DEBUG") == "1",
    )
