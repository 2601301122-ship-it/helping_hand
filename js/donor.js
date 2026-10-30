/**
 * FoodBridge - Donor Dashboard Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  await ui.setupGlobalNavigation("donor-dashboard");

  const user = await auth.getCurrentUser();
  if (!user || user.role !== "donor") return;
  let editingDonationId = null;

  // Populate Donor Organization Header Info
  const donorOrgName = document.getElementById("donor-org-name");
  const donorOrgSub = document.getElementById("donor-org-sub");
  if (donorOrgName) donorOrgName.textContent = user.organization || "Grand Heritage Palace";
  if (donorOrgSub) donorOrgSub.textContent = `${user.orgType || "Food Business"} • ${user.city || "Metro Central"}`;

  // Allergen Chip Selector Logic for Modal
  const allergenChips = document.querySelectorAll(".modal-allergen-chip");
  allergenChips.forEach(chip => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("selected");
    });
  });

  const donationForm = document.getElementById("new-donation-form");
  const donationSubmitButton = donationForm && donationForm.querySelector("button[type='submit']");
  const donationModalTitle = document.getElementById("donation-modal-title");

  function resetDonationForm() {
    editingDonationId = null;
    if (donationForm) donationForm.reset();
    allergenChips.forEach(chip => chip.classList.remove("selected"));
    presetPhotos.forEach((thumb, index) => {
      thumb.style.borderColor = index === 0 ? "var(--color-primary)" : "transparent";
    });
    if (donationModalTitle) donationModalTitle.textContent = "Publish New Surplus Food Batch";
    if (donationSubmitButton) donationSubmitButton.textContent = "Publish Surplus Food Donation";
    if (imgPreview && customImgInput) imgPreview.src = customImgInput.value;
  }

  document.addEventListener("click", event => {
    if (event.target.closest(".open-new-donation-btn")) {
      resetDonationForm();
    }
  });

  // Photo Preset Selector
  const presetPhotos = document.querySelectorAll(".preset-photo-thumb");
  const customImgInput = document.getElementById("donation-img-url");
  const imgPreview = document.getElementById("selected-img-preview");

  presetPhotos.forEach(thumb => {
    thumb.addEventListener("click", () => {
      presetPhotos.forEach(t => t.style.borderColor = "transparent");
      thumb.style.borderColor = "var(--color-primary)";
      const url = thumb.getAttribute("data-url");
      if (customImgInput) customImgInput.value = url;
      if (imgPreview) imgPreview.src = url;
    });
  });

  if (customImgInput) {
    customImgInput.addEventListener("input", () => {
      if (imgPreview && customImgInput.value) {
        imgPreview.src = customImgInput.value;
      }
    });
  }

  // Load and Render Metrics
  async function loadDonorData() {
    const allDonations = await api.getDonations();
    const donorDonations = allDonations.filter(d => d.donorId === user.id);

    const activeDonations = donorDonations.filter(d => ["Available", "Requested", "Accepted"].includes(d.status));
    const completedDonations = donorDonations.filter(d => ["Collected", "Completed"].includes(d.status));

    const allRequests = await api.getRequests();
    const inboundRequests = allRequests.filter(r => {
      const parentDonation = donorDonations.find(d => d.id === r.donationId);
      return !!parentDonation;
    });

    const pendingRequests = inboundRequests.filter(r => r.status === "Pending");

    const totalRescuedKg = completedDonations.reduce((acc, d) => acc + (d.approxWeightKg || 0), 0);
    const estimatedMeals = Math.round(totalRescuedKg / 0.45);

    // Update Metric Cards
    const elActiveCount = document.getElementById("metric-active-count");
    const elPendingRequests = document.getElementById("metric-pending-requests");
    const elRescuedKg = document.getElementById("metric-rescued-kg");
    const elMealsProvided = document.getElementById("metric-meals-provided");

    if (elActiveCount) elActiveCount.textContent = activeDonations.length;
    if (elPendingRequests) elPendingRequests.textContent = pendingRequests.length;
    if (elRescuedKg) elRescuedKg.textContent = `${totalRescuedKg} kg`;
    if (elMealsProvided) elMealsProvided.textContent = `${estimatedMeals}`;

    renderActiveDonations(activeDonations);
    renderInboundRequests(inboundRequests, donorDonations);
    renderCompletedDonations(completedDonations);
  }

  function toDateTimeLocal(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  // Render Active Listings Table
  function renderActiveDonations(donations) {
    const container = document.getElementById("active-donations-tbody");
    if (!container) return;

    if (donations.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state" style="border:none; padding: 2.5rem 1rem;">
            <p>No active surplus food published yet.</p>
            <button class="btn btn-primary btn-sm open-new-donation-btn" onclick="ui.openModal('new-donation-modal')">
              + Post Your First Surplus Batch
            </button>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = donations.map(d => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <img src="${d.image}" alt="" style="width:48px; height:48px; border-radius:var(--radius-md); object-fit:cover;" />
            <div>
              <div style="font-weight:700; color:var(--color-text);">${d.title}</div>
              <span style="font-size:0.78rem; color:var(--color-text-muted);">${d.id} • ${d.category}</span>
            </div>
          </div>
        </td>
        <td><strong>${d.quantity} ${d.unit}</strong></td>
        <td>${d.storageCondition.split("(")[0]}</td>
        <td>
          <div style="font-size:0.82rem;">${new Date(d.pickupDeadline).toLocaleDateString()}</div>
          <div style="font-size:0.78rem; color:var(--color-text-light);">${new Date(d.pickupDeadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </td>
        <td>${ui.renderStatusBadge(d.status)}</td>
        <td>
          <div class="table-actions">
            <a href="donation-details.html?id=${d.id}" class="btn btn-outline btn-sm" title="View details">
              View
            </a>
            ${d.status === "Available" ? `
              <button class="btn btn-ghost btn-sm edit-donation-btn" data-id="${d.id}" title="Edit listing">
                Edit
              </button>
              <button class="btn btn-ghost btn-sm delete-donation-btn" data-id="${d.id}" style="color:#DC2626;" title="Withdraw donation">
                Withdraw
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join("");

    // Bind action listeners
    container.querySelectorAll(".edit-donation-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const donation = await api.getDonationById(btn.getAttribute("data-id"));
        if (!donation || donation.donorId !== user.id || donation.status !== "Available") {
          ui.showToast("Only your available listings can be edited.", "warning");
          loadDonorData();
          return;
        }

        editingDonationId = donation.id;
        document.getElementById("donation-title").value = donation.title || "";
        document.getElementById("donation-desc").value = donation.description || "";
        document.getElementById("donation-category").value = donation.category || "";
        document.getElementById("donation-quantity").value = donation.quantity || "";
        document.getElementById("donation-unit").value = donation.unit || "";
        document.getElementById("donation-weight").value = donation.approxWeightKg || "";
        document.getElementById("donation-prep-time").value = toDateTimeLocal(donation.prepDateTime);
        document.getElementById("donation-deadline").value = toDateTimeLocal(donation.pickupDeadline);
        document.getElementById("donation-storage").value = donation.storageCondition || "";
        document.getElementById("donation-location").value = donation.generalLocation || "";
        document.getElementById("donation-instructions").value = donation.pickupInstructions || "";
        document.getElementById("donation-img-url").value = donation.image || "";
        if (imgPreview) imgPreview.src = donation.image || "";
        allergenChips.forEach(chip => {
          chip.classList.toggle("selected", (donation.allergens || []).includes(chip.getAttribute("data-allergen")));
        });
        presetPhotos.forEach(thumb => {
          thumb.style.borderColor = thumb.getAttribute("data-url") === donation.image
            ? "var(--color-primary)"
            : "transparent";
        });
        if (donationModalTitle) donationModalTitle.textContent = "Edit Surplus Food Listing";
        if (donationSubmitButton) donationSubmitButton.textContent = "Save Listing Changes";
        ui.openModal("new-donation-modal");
      });
    });

    container.querySelectorAll(".delete-donation-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to withdraw this surplus food donation?")) {
          try {
            await api.deleteDonation(id);
            ui.showToast("Donation listing withdrawn.", "info");
            await loadDonorData();
          } catch (error) {
            ui.showToast(error.message, "error", "Could Not Withdraw Listing");
          }
        }
      });
    });

  }

  // Render Inbound Collection Requests
  function renderInboundRequests(requests, donorDonations) {
    const container = document.getElementById("inbound-requests-container");
    if (!container) return;

    if (requests.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No community organisation collection requests at the moment.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = requests.map(r => {
      const parent = donorDonations.find(d => d.id === r.donationId);
      const isPending = r.status === "Pending";

      return `
        <div class="card" style="margin-bottom:1rem; border-left: 4px solid ${isPending ? 'var(--color-accent-gold)' : 'var(--color-primary)'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <span class="badge ${isPending ? 'badge-requested' : 'badge-accepted'}" style="margin-bottom:0.4rem;">
                ${r.status}
              </span>
              <h4 style="margin:0.2rem 0; font-size:1.1rem;">Request for: ${r.donationTitle}</h4>
              <div style="font-size:0.85rem; color:var(--color-text-muted);">
                Organisation: <strong>${r.ngoName}</strong> • Rep: ${r.ngoContact}
              </div>
            </div>
            <div style="font-size:0.8rem; color:var(--color-text-light);">
              Requested: ${new Date(r.createdAt).toLocaleString()}
            </div>
          </div>

          <div style="background:var(--color-surface-soft); padding:0.85rem 1rem; border-radius:var(--radius-md); font-size:0.88rem; margin-bottom:1rem; display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem;">
            <div>
              <span style="color:var(--color-text-muted); display:block; font-size:0.75rem; text-transform:uppercase;">Intended Beneficiaries</span>
              <strong>${r.servingEstimate}</strong>
            </div>
            <div>
              <span style="color:var(--color-text-muted); display:block; font-size:0.75rem; text-transform:uppercase;">Transport / Vehicle</span>
              <strong>${r.vehicleType}</strong>
            </div>
            <div>
              <span style="color:var(--color-text-muted); display:block; font-size:0.75rem; text-transform:uppercase;">Target Arrival</span>
              <strong>${r.estimatedPickupTime}</strong>
            </div>
          </div>

          ${r.notes ? `<p style="font-size:0.88rem; font-style:italic; margin-bottom:1rem; color:var(--color-text);">"${r.notes}"</p>` : ''}

          ${isPending ? `
            <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
              <button class="btn btn-outline btn-sm reject-request-btn" data-id="${r.id}" style="color:#DC2626;">
                Decline Request
              </button>
              <button class="btn btn-primary btn-sm accept-request-btn" data-id="${r.id}">
                ${ui.icons.check} Accept & Coordinate Pickup
              </button>
            </div>
          ` : `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:${r.status === "Rejected" ? '#991B1B' : '#166534'};">
              <span>${r.status === "Accepted"
                ? "✓ Request accepted. Private pickup instructions dispatched to organisation."
                : r.status === "Rejected"
                  ? "Request declined. This request is closed."
                  : "✓ Collection handover confirmed."}</span>
              <a href="donation-details.html?id=${r.donationId}" class="btn btn-ghost btn-sm">Inspect Listing</a>
            </div>
          `}
        </div>
      `;
    }).join("");

    // Bind Accept / Reject handlers
    container.querySelectorAll(".accept-request-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const reqId = btn.getAttribute("data-id");
        btn.disabled = true;
        btn.textContent = "Accepting...";
        try {
          await api.updateRequestStatus(reqId, "Accepted");
          ui.showToast("Request accepted! Specific pickup logistics shared with organisation.", "success", "Pickup Confirmed");
          loadDonorData();
        } catch (error) {
          ui.showToast(error.message || "Unable to accept this collection request.", "error");
          loadDonorData();
        }
      });
    });

    container.querySelectorAll(".reject-request-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const reqId = btn.getAttribute("data-id");
        if (confirm("Decline this collection request? The item will remain available for other organisations.")) {
          try {
            await api.updateRequestStatus(reqId, "Rejected");
            ui.showToast("Request declined. Food listing remains Available.", "info");
            loadDonorData();
          } catch (error) {
            ui.showToast(error.message || "Unable to decline this collection request.", "error");
            loadDonorData();
          }
        }
      });
    });
  }

  // Render Completed Past Donations
  function renderCompletedDonations(completed) {
    const container = document.getElementById("completed-donations-tbody");
    if (!container) return;

    if (completed.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state" style="border:none; padding: 2rem 1rem;">
            <p>No completed food rescue handovers yet.</p>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = completed.map(d => `
      <tr>
        <td>
          <div style="font-weight:700;">${d.title}</div>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">${d.id} • ${d.category}</span>
        </td>
        <td>${d.quantity} ${d.unit} (~${d.approxWeightKg} kg)</td>
        <td>${d.acceptedNgoName || d.collectedBy || "Verified Community Partner"}</td>
        <td>${new Date(d.createdAt).toLocaleDateString()}</td>
        <td>${ui.renderStatusBadge(d.status)}</td>
      </tr>
    `).join("");
  }

  // Handle New Donation Form Submission
  const newDonationForm = document.getElementById("new-donation-form");
  const aiSuggestButton = document.getElementById("food-ai-suggest-btn");
  const aiSuggestNotice = document.getElementById("food-ai-suggest-notice");
  if (aiSuggestButton) {
    aiSuggestButton.addEventListener("click", async () => {
      aiSuggestButton.disabled = true;
      aiSuggestButton.textContent = "Generating suggestion...";
      try {
        const suggestion = await api.suggestFoodDetails({
          title: document.getElementById("donation-title").value.trim(),
          description: document.getElementById("donation-desc").value.trim()
        });
        document.getElementById("donation-category").value = suggestion.category;
        document.getElementById("donation-desc").value = suggestion.description;
        if (aiSuggestNotice) {
          aiSuggestNotice.textContent = `${suggestion.notice} (${suggestion.model})`;
        }
        ui.showToast("Review the suggested category and description before publishing.", "success", "Suggestion Ready");
      } catch (error) {
        ui.showToast(error.message, "error", "AI Suggestion Unavailable");
      } finally {
        aiSuggestButton.disabled = false;
        aiSuggestButton.textContent = "Suggest Category & Description";
      }
    });
  }

  if (newDonationForm) {
    newDonationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("donation-title").value.trim();
      const description = document.getElementById("donation-desc").value.trim();
      const category = document.getElementById("donation-category").value;
      const quantity = Number(document.getElementById("donation-quantity").value);
      const unit = document.getElementById("donation-unit").value.trim();
      const approxWeightKg = Number(document.getElementById("donation-weight").value) || Math.round(quantity * 0.5);
      const prepDateInput = document.getElementById("donation-prep-time").value;
      const deadlineInput = document.getElementById("donation-deadline").value;
      const storageCondition = document.getElementById("donation-storage").value;
      const generalLocation = document.getElementById("donation-location").value.trim();
      const pickupInstructions = document.getElementById("donation-instructions").value.trim();
      const safetyConfirmed = document.getElementById("donation-safety-confirm").checked;

      // Extract selected allergens
      const selectedAllergens = [];
      document.querySelectorAll(".modal-allergen-chip.selected").forEach(c => {
        selectedAllergens.push(c.getAttribute("data-allergen"));
      });

      // Image
      let image = document.getElementById("donation-img-url").value.trim();
      if (!image) {
        image = "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80";
      }

      if (!safetyConfirmed) {
        ui.showToast("Please acknowledge compliance with food safety preparation standards.", "warning");
        return;
      }

      const submitBtn = donationSubmitButton;
      submitBtn.disabled = true;
      submitBtn.textContent = editingDonationId ? "Saving Listing Changes..." : "Publishing Surplus Listing...";

      try {
        const prepDate = new Date(prepDateInput);
        const deadlineDate = new Date(deadlineInput);
        if (!Number.isFinite(prepDate.getTime()) || !Number.isFinite(deadlineDate.getTime())) {
          throw new Error("Enter valid preparation and collection dates.");
        }
        const donationData = {
          title,
          description,
          category,
          quantity,
          unit,
          approxWeightKg,
          prepDateTime: prepDate.toISOString(),
          pickupDeadline: deadlineDate.toISOString(),
          storageCondition,
          allergens: selectedAllergens,
          generalLocation,
          pickupInstructions,
          image
        };
        const isEditing = Boolean(editingDonationId);
        if (isEditing) {
          await api.updateDonation(editingDonationId, donationData);
        } else {
          await api.createDonation({
            ...donationData,
            donorId: user.id,
            donorName: user.organization || user.name,
            donorType: user.orgType || "Food Business",
            city: user.city || "Metro Central"
          });
        }

        ui.closeModal("new-donation-modal");
        ui.showToast(
          isEditing ? "Surplus food listing updated successfully." : "Surplus food donation published successfully!",
          "success",
          isEditing ? "Listing Updated" : "Listing Live"
        );
        resetDonationForm();
        submitBtn.disabled = false;
        loadDonorData();
      } catch (err) {
        console.error(err);
        ui.showToast(err.message || "Unable to save the donation listing.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = editingDonationId ? "Save Listing Changes" : "Publish Surplus Food Donation";
      }
    });
  }

  // Dashboard Tabs Switcher
  const donorTabs = document.querySelectorAll(".donor-nav-tab");
  donorTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      donorTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.getAttribute("data-target");
      document.querySelectorAll(".donor-tab-pane").forEach(pane => {
        pane.style.display = pane.id === target ? "block" : "none";
      });
    });
  });

  // Initial Data Load
  try {
    await loadDonorData();
  } catch (error) {
    ui.showToast(error.message, "error", "Could Not Load Donor Data");
  }
});
