/**
 * NGO collection capacity backed by the Flask API.
 */

const capacityManager = {
  async getDeclaredCapacity() {
    return api.getNgoCapacity();
  },

  async setDeclaredCapacity(_ngoId, maxKg) {
    const value = Number(maxKg);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Capacity must be a positive number.");
    }
    return api.setNgoCapacity(value);
  },

  async canAcceptMore(_ngoId, requestedKg) {
    const capacity = await this.getDeclaredCapacity();
    const requestedWeight = Number(requestedKg) || 0;
    return {
      canAccept: capacity.remainingKg >= requestedWeight,
      committedKg: capacity.committedKg,
      remainingCapacity: capacity.remainingKg,
      maxKg: capacity.maxKg,
      activeRequests: capacity.activeRequests
    };
  },

  async renderCapacityWidget(containerId, ngoId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = await this.canAcceptMore(ngoId, 0);
    const fillPct = Math.min(100, Math.round((data.committedKg / data.maxKg) * 100));
    const fillColor = fillPct >= 85 ? "#EF4444" : fillPct >= 60 ? "#F59E0B" : "#22C55E";

    container.innerHTML = `
      <div class="card" style="margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
          <h4 style="font-size:1rem; margin:0; display:flex; align-items:center; gap:0.5rem;">
            ⚖️ Organisation Collection Capacity
          </h4>
          <button type="button" class="btn btn-ghost btn-sm capacity-update-btn" style="font-size:0.78rem;">
            Update
          </button>
        </div>
        <div style="margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:0.4rem; color:var(--color-text-muted);">
            <span>Active commitments</span>
            <span><strong>${data.committedKg} kg</strong> of ${data.maxKg} kg declared max</span>
          </div>
          <div style="height:10px; background:var(--color-surface-soft); border-radius:999px; overflow:hidden;">
            <div style="width:${fillPct}%; height:100%; background:${fillColor}; border-radius:999px; transition:width 0.5s ease;"></div>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
          <span style="color:${data.committedKg < data.maxKg ? "#166534" : "#991B1B"}; font-weight:600;">
            ${data.remainingCapacity > 0 ? `✓ ${data.remainingCapacity} kg remaining capacity` : "⚠️ At maximum collection capacity"}
          </span>
          <span style="color:var(--color-text-muted);">${data.activeRequests} active request(s)</span>
        </div>
      </div>
    `;

    container.querySelector(".capacity-update-btn").addEventListener("click", () => {
      this.showCapacityUpdateDialog(ngoId);
    });
  },

  async showCapacityUpdateDialog(ngoId) {
    try {
      const current = await this.getDeclaredCapacity();
      const newVal = prompt(
        `Update your maximum active collection capacity in kg (current: ${current.maxKg} kg):`,
        current.maxKg
      );
      if (newVal === null) return;
      const updated = await this.setDeclaredCapacity(ngoId, newVal);
      ui.showToast(`Collection capacity updated to ${updated.maxKg} kg.`, "success", "Capacity Updated");
      await this.renderCapacityWidget("ngo-capacity-widget", ngoId);
    } catch (error) {
      ui.showToast(error.message, "warning", "Could Not Update Capacity");
    }
  }
};
