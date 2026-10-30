/**
 * FoodBridge API client. All application data and permissions are managed by Flask.
 */

const STORAGE_KEYS = {
  THEME: "foodbridge_theme"
};

const api = {
  _csrfToken: null,

  async _request(path, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = { Accept: "application/json", ...options.headers };
    const requestOptions = {
      ...options,
      method,
      headers,
      credentials: "same-origin"
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      requestOptions.body = JSON.stringify(options.body);
    }

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      if (!this._csrfToken) {
        const tokenResponse = await fetch("/api/auth/csrf", {
          credentials: "same-origin",
          headers: { Accept: "application/json" }
        });
        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
          throw new Error(tokenData.error || "Could not initialize a secure session.");
        }
        this._csrfToken = tokenData.csrf_token;
      }
      headers["X-CSRF-Token"] = this._csrfToken;
    }

    const response = await fetch(path, requestOptions);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && !path.startsWith("/api/auth/")) {
        window.location.href = "login.html";
      }
      const error = new Error(data.error || `Request failed (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    if (data && data.csrf_token) this._csrfToken = data.csrf_token;
    return data;
  },

  _query(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "all") {
        params.set(key, value);
      }
    });
    const query = params.toString();
    return query ? `?${query}` : "";
  },

  async getDonations(filter = {}) {
    return this._request(`/api/donations${this._query(filter)}`);
  },

  async getDonationById(id) {
    try {
      return await this._request(`/api/donations/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  async createDonation(donationData) {
    return this._request("/api/donations", { method: "POST", body: donationData });
  },

  async updateDonation(id, updates) {
    return this._request(`/api/donations/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: updates
    });
  },

  async deleteDonation(id) {
    return this._request(`/api/donations/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
  },

  async getRequests(filter = {}) {
    return this._request(`/api/requests${this._query(filter)}`);
  },

  async createRequest(requestData) {
    return this._request("/api/requests", { method: "POST", body: requestData });
  },

  async updateRequestStatus(requestId, status, extraNotes = "") {
    return this._request(`/api/requests/${encodeURIComponent(requestId)}/status`, {
      method: "PATCH",
      body: { status, notes: extraNotes }
    });
  },

  async getNgoCapacity() {
    return this._request("/api/capacity");
  },

  async setNgoCapacity(maxKg) {
    return this._request("/api/capacity", {
      method: "PUT",
      body: { maxKg }
    });
  },

  async getUsers(role = null) {
    return this._request(`/api/users${this._query({ role })}`);
  },

  async getUserById(id) {
    return this._request(`/api/users/${encodeURIComponent(id)}`);
  },

  async updateUser(id, updates) {
    return this._request(`/api/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: updates
    });
  },

  async verifyNGO(ngoId, approve = true) {
    return this._request(`/api/admin/verify-ngo/${encodeURIComponent(ngoId)}`, {
      method: "POST",
      body: { approve }
    });
  },

  async getMetrics() {
    return this._request("/api/metrics");
  },

  async getHealth() {
    return this._request("/api/health");
  },

  async getActivities() {
    return this._request("/api/activities");
  },

  async resetDemoData() {
    return this._request("/api/admin/reset-demo", { method: "POST", body: {} });
  },

  async suggestFoodDetails(foodData) {
    return this._request("/api/ai/food-suggestion", {
      method: "POST",
      body: foodData
    });
  }
};
