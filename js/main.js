/**
 * FoodBridge - Landing Page Interactions
 */

document.addEventListener("DOMContentLoaded", async () => {
  await ui.setupGlobalNavigation("home");

  // Animate Impact Statistics
  const metrics = await api.getMetrics();
  
  const statMeals = document.getElementById("stat-meals");
  const statDonations = document.getElementById("stat-donations");
  const statWeight = document.getElementById("stat-weight");
  const statCo2 = document.getElementById("stat-co2");

  if (statMeals) statMeals.textContent = `${metrics.estimatedMeals.toLocaleString()}+`;
  if (statDonations) statDonations.textContent = `${metrics.totalDonations.toLocaleString()}`;
  if (statWeight) statWeight.textContent = `${metrics.rescuedWeightKg.toLocaleString()} kg`;
  if (statCo2) statCo2.textContent = `${metrics.co2SavedKg.toLocaleString()} kg`;

  // Render Featured Surplus Food Donations
  const featuredContainer = document.getElementById("featured-donations-grid");
  if (featuredContainer) {
    const donations = await api.getDonations({ status: "Available" });
    const featured = donations.slice(0, 3);

    if (featured.length === 0) {
      featuredContainer.innerHTML = `<div class="empty-state"><p>No surplus food listings at this moment.</p></div>`;
    } else {
      featuredContainer.innerHTML = featured.map(d => `
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
              ${ui.icons.box} <span>${d.donorName} (${d.donorType})</span>
            </div>
            <div class="donation-card-donor" style="margin-top:-0.3rem;">
              ${ui.icons.mapPin} <span>${d.generalLocation}</span>
            </div>
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
              <a href="donation-details.html?id=${d.id}" class="btn btn-outline btn-sm">
                View Details ${ui.icons.arrowRight}
              </a>
            </div>
          </div>
        </div>
      `).join("");
    }
  }

  // Floating Action Listeners
  const donateBtn = document.getElementById("hero-donate-btn");
  const findBtn = document.getElementById("hero-find-btn");

  if (donateBtn) {
    donateBtn.addEventListener("click", () => {
      window.location.href = "donor-dashboard.html";
    });
  }

  if (findBtn) {
    findBtn.addEventListener("click", () => {
      window.location.href = "browse.html";
    });
  }
});
