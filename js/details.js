/**
 * FoodBridge - Donation Details & Request Coordination
 */

document.addEventListener("DOMContentLoaded", async () => {
  await ui.setupGlobalNavigation("browse");

  const urlParams = new URLSearchParams(window.location.search);
  const donationId = urlParams.get("id") || "FB-DON-101";

  const donation = await api.getDonationById(donationId);
  const user = await auth.getCurrentUser();

  const container = document.getElementById("details-container");

  if (!donation) {
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${ui.icons.alertTriangle}</div>
          <h2 class="empty-state-title">Donation Not Found</h2>
          <p class="empty-state-text">The requested surplus food listing may have expired, been withdrawn, or does not exist.</p>
          <a href="browse.html" class="btn btn-primary">Browse Available Donations</a>
        </div>
      `;
    }
    return;
  }

  // Format Dates
  const prepDate = new Date(donation.prepDateTime);
  const prepFormatted = isNaN(prepDate.getTime()) ? donation.prepDateTime : prepDate.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const deadlineDate = new Date(donation.pickupDeadline);
  const deadlineFormatted = isNaN(deadlineDate.getTime()) ? donation.pickupDeadline : deadlineDate.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const allergensList = (donation.allergens && donation.allergens.length > 0)
    ? donation.allergens.map(a => `<span class="allergen-chip selected" style="cursor:default;">⚠️ Contains ${a}</span>`).join(" ")
    : `<span class="category-pill" style="color:#166534; background:#DCFCE7;">✓ No major allergens declared</span>`;

  const dietaryList = (donation.dietary && donation.dietary.length > 0)
    ? donation.dietary.map(d => `<span class="category-pill">${d}</span>`).join(" ")
    : "";

  const isAvailable = donation.status === "Available";
  const isDonorOwner = user && user.id === donation.donorId;
  const isNGO = user && user.role === "ngo";
  const isVerifiedNGO = isNGO && user.verified;

  if (container) {
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <a href="browse.html" class="btn btn-ghost btn-sm" style="display:inline-flex; align-items:center; gap:0.4rem; padding-left:0;">
          ← Back to All Surplus Food
        </a>
      </div>

      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 2.5rem; align-items: flex-start;" class="details-layout-grid">
        <!-- Left: Image & In-Depth Details -->
        <div>
          <div style="border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--color-border); margin-bottom: 2rem; box-shadow: var(--shadow-md);">
            <img src="${donation.image}" alt="${donation.title}" style="width: 100%; height: 420px; object-fit: cover;" />
          </div>

          <div class="card" style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Food Description & Preparation Notes</h2>
            <p style="font-size: 1rem; line-height: 1.7; color: var(--color-text); margin-bottom: 1.5rem;">
              ${donation.description}
            </p>

            <h3 style="font-size: 1.15rem; margin-bottom: 0.75rem;">Declared Allergens & Dietary Attributes</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
              ${allergensList}
              ${dietaryList}
            </div>

            <!-- Food Safety Reminder -->
            <div class="food-safety-banner">
              <div class="food-safety-banner-icon">${ui.icons.shieldCheck}</div>
              <div>
                <strong>FoodBridge Safety & Responsible Donation Protocol</strong>
                <p style="margin: 0.35rem 0 0; font-size: 0.84rem; color: inherit;">
                  FoodBridge coordinates surplus logistics but cannot verify cooking conditions on-site. Donors certify adherence to food hygiene standards. Receiving community organisations must perform sensory and thermal checks upon arrival before distributing.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Pickup Logistics & Action Card -->
        <div>
          <div class="card" style="position: sticky; top: calc(var(--header-height) + 1.5rem);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <span class="category-pill">${donation.category}</span>
              ${ui.renderStatusBadge(donation.status)}
            </div>

            <h1 style="font-size: 1.65rem; margin-bottom: 0.5rem; line-height: 1.25;">${donation.title}</h1>

            <div style="font-size: 0.9rem; color: var(--color-text-muted); display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1.5rem;">
              ${ui.icons.box} <strong>${donation.donorName}</strong> (${donation.donorType})
            </div>

            <div style="background-color: var(--color-surface-soft); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                  <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-text-light);">Available Quantity</div>
                  <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary);">${donation.quantity} ${donation.unit}</div>
                  <div style="font-size: 0.8rem; color: var(--color-text-muted);">~${donation.approxWeightKg} kg total</div>
                </div>
                <div>
                  <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-text-light);">Storage Spec</div>
                  <div style="font-size: 0.95rem; font-weight: 700; margin-top: 0.2rem;">${donation.storageCondition}</div>
                </div>
              </div>

              <div style="border-top: 1px solid var(--color-border); padding-top: 0.85rem; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.88rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--color-text-muted);">Prepared On:</span>
                  <strong>${prepFormatted}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--color-text-muted);">Collection Deadline:</span>
                  <strong style="color: #DC2626;">${deadlineFormatted}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--color-text-muted);">Time Remaining:</span>
                  <strong>${ui.formatTimeRemaining(donation.pickupDeadline)}</strong>
                </div>
              </div>
            </div>

            <!-- Location & Privacy Callout -->
            <div style="margin-bottom: 1.75rem;">
              <h4 style="font-size: 0.95rem; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                ${ui.icons.mapPin} General Area: ${donation.generalLocation} (${donation.city})
              </h4>
              <div style="padding: 0.75rem 0.9rem; background-color: var(--color-surface-soft); border-radius: var(--radius-md); font-size: 0.8rem; color: var(--color-text-muted); border: 1px dashed var(--color-border);">
                🔒 <strong>Donor Privacy Protection:</strong> Specific street address and direct phone contact are released exclusively to the verified NGO upon collection acceptance.
              </div>
            </div>

            <!-- Request / Action Buttons -->
            <div id="action-container">
              ${renderActionButtons(donation, user, isAvailable, isDonorOwner, isNGO, isVerifiedNGO)}
            </div>

          </div>
        </div>
      </div>
    `;

    // Bind Collection Request Button
    const requestBtn = document.getElementById("open-request-modal-btn");
    if (requestBtn) {
      requestBtn.addEventListener("click", () => {
        ui.openModal("request-collection-modal");
      });
    }

    // Bind Request Form Submit
    const requestForm = document.getElementById("request-collection-form");
    if (requestForm) {
      requestForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const servingEstimate = document.getElementById("request-servings").value.trim();
        const vehicleType = document.getElementById("request-vehicle").value;
        const pickupTimeInput = document.getElementById("request-time").value;
        const pickupDate = new Date(pickupTimeInput);
        if (!Number.isFinite(pickupDate.getTime()) || pickupDate <= new Date()) {
          ui.showToast("Choose an estimated pickup time in the future.", "warning");
          return;
        }
        const estimatedPickupTime = pickupDate.toISOString();
        const notes = document.getElementById("request-notes").value.trim();
        const complianceConfirmed = document.getElementById("request-compliance").checked;

        if (!complianceConfirmed) {
          ui.showToast("Please acknowledge safe thermal transport requirements", "warning");
          return;
        }

        let capacity;
        try {
          capacity = await capacityManager.canAcceptMore(user.id, donation.approxWeightKg);
        } catch (error) {
          ui.showToast(error.message, "error", "Could Not Check Capacity");
          return;
        }
        if (!capacity.canAccept) {
          ui.showToast(
            `This donation exceeds your remaining collection capacity of ${capacity.remainingCapacity} kg. Update your capacity or choose a smaller donation.`,
            "warning",
            "Capacity Limit Reached"
          );
          return;
        }

        const submitBtn = requestForm.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting Request...";

        try {
          await api.createRequest({
            donationId: donation.id,
            donationTitle: donation.title,
            ngoId: user.id,
            ngoName: user.organization || user.name,
            ngoContact: `${user.name} (${user.phone})`,
            servingEstimate,
            vehicleType,
            estimatedPickupTime,
            notes,
            weightKg: donation.approxWeightKg
          });

          ui.closeModal("request-collection-modal");
          ui.showToast("Collection request sent to donor for review!", "success", "Request Dispatched");
          
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (err) {
          console.error(err);
          ui.showToast(err.message || "Failed to submit collection request.", "error");
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Collection Request";
        }
      });
    }
  }

  function renderActionButtons(donation, user, isAvailable, isDonorOwner, isNGO, isVerifiedNGO) {
    if (!user) {
      return `
        <a href="login.html" class="btn btn-primary btn-block">
          Log In to Request Collection
        </a>
      `;
    }

    if (isDonorOwner) {
      return `
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <a href="donor-dashboard.html" class="btn btn-secondary btn-block">
            Manage in Donor Dashboard
          </a>
          <span style="font-size:0.8rem; text-align:center; color:var(--color-text-muted);">
            You are the owner of this donation listing.
          </span>
        </div>
      `;
    }

    if (donation.status === "Requested") {
      return `
        <div style="text-align:center; padding:1rem; background-color:var(--status-requested-bg); border-radius:var(--radius-md); border:1px solid var(--status-requested-border);">
          <strong style="color:var(--status-requested-text); display:block; margin-bottom:0.25rem;">Collection Request Under Review</strong>
          <span style="font-size:0.82rem; color:var(--status-requested-text);">
            Requested by: ${donation.requestedOrg || "A community partner"}
          </span>
        </div>
      `;
    }

    if (donation.status === "Accepted") {
      return `
        <div style="text-align:center; padding:1rem; background-color:var(--status-accepted-bg); border-radius:var(--radius-md); border:1px solid var(--status-accepted-border);">
          <strong style="color:var(--status-accepted-text); display:block; margin-bottom:0.25rem;">Request Accepted & Assigned</strong>
          <span style="font-size:0.82rem; color:var(--status-accepted-text);">
            Assigned to: ${donation.acceptedNgoName || "Verified Partner"}
          </span>
        </div>
      `;
    }

    if (donation.status === "Collected" || donation.status === "Completed") {
      return `
        <div style="text-align:center; padding:1rem; background-color:var(--status-collected-bg); border-radius:var(--radius-md); border:1px solid var(--status-collected-border);">
          <strong style="color:var(--status-collected-text); display:block; margin-bottom:0.25rem;">Food Successfully Rescued</strong>
          <span style="font-size:0.82rem; color:var(--status-collected-text);">
            This surplus batch was collected and delivered.
          </span>
        </div>
      `;
    }

    if (isNGO) {
      if (!isVerifiedNGO) {
        return `
          <div style="padding:1rem; background-color:#FFFBEB; border:1px solid #FDE68A; border-radius:var(--radius-md); margin-bottom:0.75rem;">
            <div style="font-weight:700; color:#92400E; margin-bottom:0.25rem; font-size:0.9rem;">⚠️ Organisation Verification Pending</div>
            <p style="font-size:0.82rem; color:#78350F; margin:0;">
              Only verified community organisations can request food collection to guarantee food hygiene and distribution legitimacy.
            </p>
          </div>
          <a href="ngo-dashboard.html" class="btn btn-secondary btn-block">Check Verification Status</a>
        `;
      }

      return `
        <button id="open-request-modal-btn" class="btn btn-primary btn-block">
          ${ui.icons.truck} Request Food Collection
        </button>
      `;
    }

    // Other signed-in roles cannot submit community collection requests.
    return `
      <div style="display:flex; flex-direction:column; gap:0.75rem; text-align:center;">
        <p style="font-size:0.88rem; color:var(--color-text-muted);">
          Only verified community organisations can request surplus food. Sign out to access an NGO account.
        </p>
      </div>
    `;
  }
});
