/**
 * FoodBridge - NGO & Community Organisation Dashboard
 */

document.addEventListener("DOMContentLoaded", async () => {
  await ui.setupGlobalNavigation("ngo-dashboard");

  const user = await auth.getCurrentUser();
  if (!user || user.role !== "ngo") return;
  
  // Organization profile display
  const orgNameEl = document.getElementById("ngo-org-name");
  const orgSubEl = document.getElementById("ngo-org-sub");
  if (orgNameEl) orgNameEl.textContent = user.organization || "Hope Harbor Community Shelter";
  if (orgSubEl) orgSubEl.textContent = `${user.orgType || "Community Shelter"} • Capacity: ${user.servingCapacity || "300 meals/day"}`;

  // Verification State Banner
  const bannerContainer = document.getElementById("ngo-verification-banner");
  function renderVerificationBanner() {
    if (!bannerContainer) return;

    if (user.verified) {
      bannerContainer.innerHTML = `
        <div class="verification-alert verified">
          <div style="display:flex; align-items:flex-start; gap:0.75rem;">
            <div style="font-size:1.4rem;">${ui.icons.shieldCheck}</div>
            <div>
              <strong>Verified Community Organisation (Accredited NGO)</strong>
              <p style="margin:0.2rem 0 0; font-size:0.85rem; color:inherit;">
                Registration ID: <code>${user.regNumber || 'NGO-REG-2022-8841'}</code>. Your organization is authorized to discover and request surplus food collections.
              </p>
            </div>
          </div>
        </div>
      `;
    } else {
      bannerContainer.innerHTML = `
        <div class="verification-alert pending">
          <div style="display:flex; align-items:flex-start; gap:0.75rem;">
            <div style="font-size:1.4rem;">⚠️</div>
            <div>
              <strong>Verification Status: Pending Platform Compliance Review</strong>
              <p style="margin:0.2rem 0 0; font-size:0.85rem; color:inherit;">
                Documentation submitted (Registration: <code>${user.regNumber || 'NGO-REG-2024-9102'}</code>). In accordance with food safety standards, donations can be requested once verified by FoodBridge platform admins.
              </p>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Load and Render NGO Data
  async function loadNgoData() {
    renderVerificationBanner();

    const allRequests = await api.getRequests();
    const ngoRequests = allRequests.filter(r => r.ngoId === user.id);

    const activeRequests = ngoRequests.filter(r => ["Pending", "Accepted", "Collected"].includes(r.status));
    const completedRequests = ngoRequests.filter(r => r.status === "Completed");

    const allDonations = await api.getDonations();
    const availableSurplus = allDonations.filter(d => d.status === "Available");

    // Metrics
    const elActiveReq = document.getElementById("metric-ngo-active-requests");
    const elMealsDistributed = document.getElementById("metric-ngo-meals");
    const elSavedKg = document.getElementById("metric-ngo-kg");

    if (elActiveReq) elActiveReq.textContent = activeRequests.length;
    
    const completedKg = completedRequests.reduce((total, request) => {
      const donation = allDonations.find(item => item.id === request.donationId);
      return total + (Number(request.weightKg) || Number(donation && donation.approxWeightKg) || 0);
    }, 0);
    if (elMealsDistributed) elMealsDistributed.textContent = `${Math.round(completedKg / 0.45)}`;
    if (elSavedKg) elSavedKg.textContent = `${completedKg} kg`;

    await capacityManager.renderCapacityWidget("ngo-capacity-widget", user.id);
    renderActiveRequests(activeRequests, allDonations);
    renderDiscoverFeed(availableSurplus);
    renderCompletedRescues(completedRequests);
  }

  // Render Active Requests
  function renderActiveRequests(requests, allDonations) {
    const container = document.getElementById("ngo-active-requests-tbody");
    if (!container) return;

    if (requests.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state" style="border:none; padding:2.5rem 1rem;">
            <p>No active surplus food collection requests.</p>
            <a href="browse.html" class="btn btn-primary btn-sm">Explore Available Surplus Food</a>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = requests.map(r => {
      const donation = allDonations.find(d => d.id === r.donationId);
      const isAccepted = r.status === "Accepted";
      const isCollected = r.status === "Collected";
      const requestBadgeClass = isAccepted ? "badge-accepted" : isCollected ? "badge-collected" : "badge-requested";
      const pickupDate = new Date(r.estimatedPickupTime);
      const pickupTime = Number.isNaN(pickupDate.getTime())
        ? r.estimatedPickupTime
        : pickupDate.toLocaleString();

      return `
        <tr>
          <td>
            <div style="font-weight:700;">${r.donationTitle}</div>
            <span style="font-size:0.75rem; color:var(--color-text-muted);">${r.donationId}</span>
          </td>
          <td>${r.vehicleType}</td>
          <td>${pickupTime}</td>
          <td>
            <span class="badge ${requestBadgeClass}">
              ${r.status}
            </span>
          </td>
          <td>
            ${isAccepted && donation && donation.acceptedNgoId === user.id && r.ngoId === user.id ? `
              <div style="font-size:0.8rem; background:var(--color-surface-soft); padding:0.4rem 0.6rem; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                📍 <strong>Pickup Info:</strong> ${donation.pickupInstructions || donation.generalLocation}
              </div>
            ` : `<span style="font-size:0.8rem; color:var(--color-text-light);">${isCollected ? "Handover confirmed" : "Disclosed upon donor acceptance"}</span>`}
          </td>
          <td>
            <div class="table-actions">
              <a href="donation-details.html?id=${r.donationId}" class="btn btn-outline btn-sm">
                Listing
              </a>
              ${isAccepted ? `
                <button class="btn btn-accent btn-sm mark-completed-btn" data-req-id="${r.id}" data-don-id="${r.donationId}">
                  Confirm Received
                </button>
                <button class="btn btn-outline btn-sm show-collection-qr-btn" data-donation-id="${r.donationId}" data-ngo-id="${r.ngoId}" data-title="${r.donationTitle}">
                  Show Collection QR
                </button>
              ` : isCollected ? `
                <button class="btn btn-accent btn-sm mark-distributed-btn" data-req-id="${r.id}">
                  Mark Distribution Complete
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    container.querySelectorAll(".mark-completed-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const reqId = btn.getAttribute("data-req-id");
        if (confirm("Confirm that food has been collected and safely brought to your community distribution point?")) {
          try {
            await api.updateRequestStatus(reqId, "Collected");
            ui.showToast("Pickup confirmed! Food rescued and entered into community meal logs.", "success", "Pickup Logged");
            loadNgoData();
          } catch (error) {
            ui.showToast(error.message || "Unable to confirm this collection.", "error");
            loadNgoData();
          }
        }
      });
    });

    container.querySelectorAll(".show-collection-qr-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        qrVerify.showVerificationModal(
          btn.getAttribute("data-donation-id"),
          btn.getAttribute("data-ngo-id"),
          btn.getAttribute("data-title")
        );
      });
    });

    container.querySelectorAll(".mark-distributed-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const requestId = btn.getAttribute("data-req-id");
        btn.disabled = true;
        try {
          await api.updateRequestStatus(requestId, "Completed");
          ui.showToast("Donation marked complete after distribution.", "success", "Rescue Completed");
          loadNgoData();
        } catch (error) {
          ui.showToast(error.message || "Unable to complete this donation.", "error");
          loadNgoData();
        }
      });
    });
  }

  // Render Discover Surplus Feed
  function renderDiscoverFeed(donations) {
    const container = document.getElementById("ngo-discover-feed");
    if (!container) return;

    if (donations.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No available surplus listings right now.</p></div>`;
      return;
    }

    container.innerHTML = donations.slice(0, 4).map(d => `
      <div class="card card-interactive" style="display:flex; flex-direction:column;">
        <div style="height:150px; border-radius:var(--radius-md); overflow:hidden; margin-bottom:0.85rem; position:relative;">
          <img src="${d.image}" alt="" style="width:100%; height:100%; object-fit:cover;" />
          <span class="donation-card-category" style="position:absolute; top:8px; left:8px;">${d.category}</span>
        </div>
        <h4 style="font-size:1.05rem; margin-bottom:0.35rem; line-height:1.3;">${d.title}</h4>
        <div style="font-size:0.82rem; color:var(--color-text-muted); margin-bottom:0.75rem;">
          ${ui.icons.box} ${d.donorName} (${d.generalLocation})
        </div>
        <div style="font-size:0.85rem; font-weight:700; color:var(--color-primary); margin-bottom:0.75rem;">
          ${d.quantity} ${d.unit} • Storage: ${d.storageCondition.split("(")[0]}
        </div>
        <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.78rem; color:#DC2626; font-weight:600;">
            ${ui.formatTimeRemaining(d.pickupDeadline)}
          </span>
          <a href="donation-details.html?id=${d.id}" class="btn btn-outline btn-sm">
            Inspect & Request
          </a>
        </div>
      </div>
    `).join("");
  }

  // Render Completed Rescues
  function renderCompletedRescues(completed) {
    const container = document.getElementById("ngo-completed-tbody");
    if (!container) return;

    if (completed.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state" style="border:none; padding:2rem 1rem;">
            <p>No completed surplus food rescues logged yet.</p>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = completed.map(r => `
      <tr>
        <td><strong>${r.donationTitle}</strong></td>
        <td>${r.servingEstimate}</td>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
        <td><span class="badge badge-completed">Rescued & Distributed</span></td>
      </tr>
    `).join("");
  }

  // Tabs
  const ngoTabs = document.querySelectorAll(".ngo-nav-tab");
  ngoTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      ngoTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.getAttribute("data-target");
      document.querySelectorAll(".ngo-tab-pane").forEach(pane => {
        pane.style.display = pane.id === target ? "block" : "none";
      });
    });
  });

  try {
    await loadNgoData();
  } catch (error) {
    ui.showToast(error.message, "error", "Could Not Load NGO Data");
  }
});
