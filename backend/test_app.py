import io
import json
import os
import sqlite3
import tempfile
import unittest
import urllib.error
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

os.environ.setdefault("FOODBRIDGE_SECRET_KEY", "test-process-only-secret-key")
_import_test_database = tempfile.TemporaryDirectory()
os.environ.setdefault(
    "FOODBRIDGE_DATABASE",
    os.path.join(_import_test_database.name, "import.sqlite3"),
)

from backend.app import create_app


class FoodBridgeApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.app = create_app(
            {
                "TESTING": True,
                "SECRET_KEY": "foodbridge-test-secret",
                "DATABASE": os.path.join(self.temp_dir.name, "test.sqlite3"),
                "DEMO_MODE": True,
                "DEMO_PASSWORD": "Local-Demo-Password-2026!",
                "ADMIN_EMAIL": None,
                "ADMIN_PASSWORD": None,
                "OLLAMA_URL": "http://127.0.0.1:11434",
                "OLLAMA_MODEL": "gemma4:e2b",
                "OLLAMA_TIMEOUT": 2,
            }
        )
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def token(self, client=None):
        client = client or self.client
        response = client.get("/api/auth/csrf")
        self.assertEqual(response.status_code, 200)
        return response.get_json()["csrf_token"]

    def post_json(self, path, body, client=None, token=None):
        client = client or self.client
        return client.post(
            path,
            json=body,
            headers={"X-CSRF-Token": token or self.token(client)},
        )

    def login(self, email, client=None):
        client = client or self.client
        token = self.token(client)
        response = self.post_json(
            "/api/auth/login",
            {"email": email, "password": "Local-Demo-Password-2026!"},
            client=client,
            token=token,
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        return response.get_json()["csrf_token"]

    def test_api_requires_csrf_for_state_changes(self):
        response = self.client.post("/api/auth/login", json={"email": "x", "password": "y"})
        self.assertEqual(response.status_code, 403)
        self.assertIn("token", response.get_json()["error"].lower())

    def test_frontend_is_served_without_exposing_backend_files(self):
        for path, expected_status in (
            ("/", 200),
            ("/js/store.js", 200),
            ("/backend/app.py", 404),
        ):
            response = self.client.get(path)
            self.assertEqual(response.status_code, expected_status)
            response.close()

    def test_configured_admin_is_bootstrapped(self):
        admin_app = create_app(
            {
                "TESTING": True,
                "SECRET_KEY": "foodbridge-admin-test-secret",
                "DATABASE": os.path.join(self.temp_dir.name, "admin.sqlite3"),
                "ADMIN_EMAIL": "admin-bootstrap@example.org",
                "ADMIN_PASSWORD": "A-Long-Unique-Administrator-Password",
            }
        )
        admin_client = admin_app.test_client()
        token = self.token(admin_client)
        response = self.post_json(
            "/api/auth/login",
            {
                "email": "admin-bootstrap@example.org",
                "password": "A-Long-Unique-Administrator-Password",
            },
            client=admin_client,
            token=token,
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["user"]["role"], "admin")

    def test_role_boundaries_and_session_authentication(self):
        response = self.post_json(
            "/api/donations",
            {"title": "Forbidden listing"},
        )
        self.assertEqual(response.status_code, 401)

        self.login("marcus@grandheritagehotel.com")
        self.assertEqual(self.client.get("/api/auth/me").get_json()["user"]["role"], "donor")
        self.assertEqual(self.client.get("/api/users").status_code, 403)

    def test_request_approval_and_collection_reveal_pickup_details(self):
        ngo_client = self.app.test_client()
        ngo_token = self.login("elena@hopeharborcommunity.org", ngo_client)
        listing = ngo_client.get("/api/donations/FB-DON-101").get_json()
        self.assertNotIn("pickupInstructions", listing)

        request_response = self.post_json(
            "/api/requests",
            {
                "donationId": "FB-DON-101",
                "servingEstimate": "90 meals",
                "vehicleType": "Refrigerated van",
                "estimatedPickupTime": (datetime.now(timezone.utc) + timedelta(hours=3)).isoformat(),
            },
            client=ngo_client,
            token=ngo_token,
        )
        self.assertEqual(request_response.status_code, 201, request_response.get_json())
        request_id = request_response.get_json()["id"]

        donor_token = self.login("marcus@grandheritagehotel.com")
        accepted = self.client.patch(
            f"/api/requests/{request_id}/status",
            json={"status": "Accepted"},
            headers={"X-CSRF-Token": donor_token},
        )
        self.assertEqual(accepted.status_code, 200, accepted.get_json())
        released = ngo_client.get("/api/donations/FB-DON-101").get_json()
        self.assertEqual(released["pickupInstructions"], "Security Gate B, Service Loading Dock 3.")

        collected = ngo_client.patch(
            f"/api/requests/{request_id}/status",
            json={"status": "Collected"},
            headers={"X-CSRF-Token": ngo_token},
        )
        self.assertEqual(collected.status_code, 200, collected.get_json())
        completed = ngo_client.patch(
            f"/api/requests/{request_id}/status",
            json={"status": "Completed"},
            headers={"X-CSRF-Token": ngo_token},
        )
        self.assertEqual(completed.status_code, 200, completed.get_json())

    def test_unverified_ngo_cannot_request_food(self):
        ngo_client = self.app.test_client()
        token = self.login("david@feedthelight.org", ngo_client)
        response = self.post_json(
            "/api/requests",
            {
                "donationId": "FB-DON-101",
                "servingEstimate": "20 meals",
                "vehicleType": "Van",
                "estimatedPickupTime": "2026-03-20T14:00:00Z",
            },
            client=ngo_client,
            token=token,
        )
        self.assertEqual(response.status_code, 403)

    def test_request_pickup_must_be_before_donation_deadline(self):
        ngo_client = self.app.test_client()
        token = self.login("elena@hopeharborcommunity.org", ngo_client)
        response = self.post_json(
            "/api/requests",
            {
                "donationId": "FB-DON-101",
                "servingEstimate": "90 meals",
                "vehicleType": "Refrigerated van",
                "estimatedPickupTime": (datetime.now(timezone.utc) + timedelta(hours=8)).isoformat(),
            },
            client=ngo_client,
            token=token,
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("deadline", response.get_json()["error"].lower())

    def test_capacity_cannot_be_reduced_below_active_commitments(self):
        token = self.login("elena@hopeharborcommunity.org")
        response = self.client.put(
            "/api/capacity",
            json={"maxKg": 40},
            headers={"X-CSRF-Token": token},
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(self.client.get("/api/capacity").get_json()["committedKg"], 80)

    def test_registration_hashes_password_and_keeps_new_ngo_pending(self):
        token = self.token()
        response = self.post_json(
            "/api/auth/register",
            {
                "name": "Sample Manager",
                "email": "manager@example.org",
                "password": "Strong-Registration-Password-2026!",
                "role": "ngo",
                "organization": "Sample Community Kitchen",
                "regNumber": "REG-123",
            },
            token=token,
        )
        self.assertEqual(response.status_code, 201, response.get_json())
        user = response.get_json()["user"]
        self.assertFalse(user["verified"])
        self.assertEqual(user["verificationStatus"], "pending")
        db = sqlite3.connect(self.app.config["DATABASE"])
        try:
            row = db.execute(
                "SELECT password_hash FROM users WHERE email = ?",
                ("manager@example.org",),
            ).fetchone()
        finally:
            db.close()
        self.assertNotIn("Strong-Registration-Password-2026!", row[0])

    def test_ai_suggestion_uses_configured_model_and_validates_result(self):
        token = self.login("marcus@grandheritagehotel.com")
        generated = {
            "response": json.dumps(
                {
                    "category": "Bakery",
                    "description": "Unserved packaged bread; confirm ingredients and storage before publishing.",
                }
            )
        }
        with patch(
            "backend.app.urllib.request.urlopen",
            return_value=io.BytesIO(json.dumps(generated).encode("utf-8")),
        ) as ollama:
            response = self.post_json(
                "/api/ai/food-suggestion",
                {"title": "Bread", "description": "Packaged and unserved."},
                token=token,
            )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["category"], "Bakery")
        self.assertIn("does not assess food safety", response.get_json()["notice"])
        sent_body = json.loads(ollama.call_args.args[0].data.decode("utf-8"))
        self.assertEqual(sent_body["model"], "gemma4:e2b")

    def test_ai_reports_local_ollama_unavailable(self):
        token = self.login("marcus@grandheritagehotel.com")
        with self.assertLogs(self.app.logger, level="ERROR"):
            with patch(
                "backend.app.urllib.request.urlopen",
                side_effect=urllib.error.URLError("connection refused"),
            ):
                response = self.post_json(
                    "/api/ai/food-suggestion",
                    {"title": "Bread", "description": ""},
                    token=token,
                )
        self.assertEqual(response.status_code, 503)
        self.assertIn("Ollama", response.get_json()["error"])

    def test_demo_reset_disabled_outside_demo_mode(self):
        admin_client = self.app.test_client()
        token = self.login("admin@foodbridge.org", admin_client)
        self.app.config["DEMO_MODE"] = False
        response = self.post_json(
            "/api/admin/reset-demo",
            {},
            client=admin_client,
            token=token,
        )
        self.assertEqual(response.status_code, 403)


if __name__ == "__main__":
    unittest.main()
