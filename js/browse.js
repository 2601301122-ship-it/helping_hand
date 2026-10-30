/**
 * FoodBridge - Browse Surplus Food Directory
 */

document.addEventListener("DOMContentLoaded", async () => {
  await ui.setupGlobalNavigation("browse");

  const searchInput = document.getElementById("search-input");
  const categoryPills = document.querySelectorAll(".category-pill-btn");
  const cityFilter = document.getElementById("city-filter");
  const statusFilter = document.getElementById("status-filter");
  const dietaryFilter = document.getElementById("dietary-filter");
  const quantityFilter = document.getElementById("quantity-filter");
  const deadlineFilter = document.getElementById("deadline-filter");
  const resultsContainer = document.getElementById("browse-results-grid");
  const resultsCount = document.getElementById("results-count");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");

  let currentCategory = "all";
  let latestRender = 0;

  // Check URL query params for initial search or category
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("category")) {
    currentCategory = urlParams.get("category");
    categoryPills.forEach(p => {
      if (p.getAttribute("data-category").toLowerCase() === currentCategory.toLowerCase()) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });
  }

  if (urlParams.get("q") && searchInput) {
    searchInput.value = urlParams.get("q");
  }

  async function renderDonations() {
    const renderId = ++latestRender;
    const query = searchInput ? searchInput.value.trim() : "";
    const city = cityFilter ? cityFilter.value : "all";
    const status = statusFilter ? statusFilter.value : "all";
    const dietary = dietaryFilter ? dietaryFilter.value : "all";
    const quantity = quantityFilter ? quantityFilter.value : "all";
    const deadlineHours = deadlineFilter ? Number(deadlineFilter.value) : 0;

    resultsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
        <p style="color: var(--color-text-muted);">Loading available surplus food listings...</p>
      </div>
    `;

    let donations = await api.getDonations({
      query,
      category: currentCategory,
      city,
      status
    });
    if (renderId !== latestRender) return;

    if (dietary !== "all") {
      donations = donations.filter(d => d.dietary && d.dietary.some(dt => dt.toLowerCase().includes(dietary.toLowerCase())));
    }

    if (quantity !== "all") {
      donations = donations.filter(d => {
        const weight = Number(d.approxWeightKg) || 0;
        if (quantity === "under-10") return weight < 10;
        if (quantity === "10-50") return weight >= 10 && weight <= 50;
        return weight > 50;
      });
    }

    if (deadlineHours > 0) {
      const deadlineLimit = Date.now() + deadlineHours * 60 * 60 * 1000;
      donations = donations.filter(d => {
        const deadline = new Date(d.pickupDeadline).getTime();
        return Number.isFinite(deadline) && deadline >= Date.now() && deadline <= deadlineLimit;
      });
    }

    if (resultsCount) {
      resultsCount.textContent = `Showing ${donations.length} surplus food listing${donations.length === 1 ? '' : 's'}`;
    }

    if (donations.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">${ui.icons.box}</div>
          <h3 class="empty-state-title">No matching surplus food found</h3>
          <p class="empty-state-text">Try adjusting your filters, location, or search keywords to discover other community rescues.</p>
          <button class="btn btn-outline btn-sm" id="empty-reset-btn">Reset All Filters</button>
        </div>
      `;

      const emptyReset = document.getElementById("empty-reset-btn");
      if (emptyReset) {
        emptyReset.addEventListener("click", resetAllFilters);
      }
      return;
    }

    resultsContainer.innerHTML = donations.map(d => {
      const isAvailable = d.status === "Available";
      return `
        <div class="donation-card">
          <div class="donation-card-img-wrapper">
            <img src="${d.image}" alt="${d.title}" class="donation-card-img" loading="lazy" />
            <div class="donation-card-badges">
              <span class="donation-card-category">${d.category}</span>
              ${ui.renderStatusBadge(d.status)}
            </div>
          </div>
          <div class="donation-card-body">
            <h3 class="donation-card-title">${d.title}</h3>
            
            <div class="donation-card-donor">
              ${ui.icons.box} <span>${d.donorName}</span>
            </div>
            
            <div class="donation-card-donor" style="margin-top:-0.3rem;">
              ${ui.icons.mapPin} <span>${d.generalLocation} (${d.city})</span>
            </div>

            <p style="font-size: 0.88rem; line-height: 1.45; margin-bottom: 0.85rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${d.description}
            </p>

            <div class="donation-meta-row">
              <div class="donation-meta-item">
                <span class="donation-meta-label">Quantity</span>
                <span class="donation-meta-val">${d.quantity} ${d.unit}</span>
              </div>
              <div class="donation-meta-item">
                <span class="donation-meta-label">Storage</span>
                <span class="donation-meta-val">${d.storageCondition.split("(")[0]}</span>
              </div>
            </div>

            <div class="donation-card-footer">
              <div class="donation-timer">
                ${ui.icons.clock} ${ui.formatTimeRemaining(d.pickupDeadline)}
              </div>
              <a href="donation-details.html?id=${d.id}" class="btn ${isAvailable ? 'btn-primary' : 'btn-outline'} btn-sm">
                ${isAvailable ? 'View & Request' : 'Inspect Details'}
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function resetAllFilters() {
    if (searchInput) searchInput.value = "";
    if (cityFilter) cityFilter.value = "all";
    if (statusFilter) statusFilter.value = "Available";
    if (dietaryFilter) dietaryFilter.value = "all";
    if (quantityFilter) quantityFilter.value = "all";
    if (deadlineFilter) deadlineFilter.value = "all";
    currentCategory = "all";

    categoryPills.forEach(p => {
      if (p.getAttribute("data-category") === "all") p.classList.add("active");
      else p.classList.remove("active");
    });

    renderDonations();
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderDonations();
    });
  }

  if (cityFilter) cityFilter.addEventListener("change", renderDonations);
  if (statusFilter) statusFilter.addEventListener("change", renderDonations);
  if (dietaryFilter) dietaryFilter.addEventListener("change", renderDonations);
  if (quantityFilter) quantityFilter.addEventListener("change", renderDonations);
  if (deadlineFilter) deadlineFilter.addEventListener("change", renderDonations);
  if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", resetAllFilters);

  categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      categoryPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.getAttribute("data-category");
      renderDonations();
    });
  });

  // Initial render
  await renderDonations();
});
