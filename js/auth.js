/**
 * FoodBridge server-backed authentication.
 */

const auth = {
  async getCurrentUser() {
    const result = await api._request("/api/auth/me");
    return result.user;
  },

  async login(email, password, remember = true) {
    const result = await api._request("/api/auth/login", {
      method: "POST",
      body: { email, password, remember }
    });
    window.dispatchEvent(
      new CustomEvent("foodbridge:authChanged", { detail: result.user })
    );
    return result.user;
  },

  async register(registrationData) {
    const result = await api._request("/api/auth/register", {
      method: "POST",
      body: registrationData
    });
    window.dispatchEvent(
      new CustomEvent("foodbridge:authChanged", { detail: result.user })
    );
    return result.user;
  },

  async logout() {
    await api._request("/api/auth/logout", { method: "POST", body: {} });
    window.location.href = "login.html";
  }
};
