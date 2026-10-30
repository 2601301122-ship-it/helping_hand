/**
 * FoodBridge - Admin & Platform Compliance Dashboard
 */

document.addEventListener("DOMContentLoaded", async () => {
  await ui.setupGlobalNavigation("admin-dashboard");
  const currentUser = await auth.getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") return;

  // Load Admin Data
  async function loadAdminData() {
    const metrics = await api.getMetrics();
    const resetButton = document.getElementById("admin-reset-demo-btn");
    if (resetButton) resetButton.hidden = !metrics.demoMode;
    const users = await api.getUsers();
    const donations = await api.getDonations();
    const activities = await api.getActivities();

    // Fill Metrics
    const elUsers = document.getElementById("admin-metric-users");
    const elDonors = document.getElementById("admin-metric-donors");
    const elNgos = document.getElementById("admin-metric-ngos");
    const elDonations = document.getElementById("admin-metric-donations");
    const elPending = document.getElementById("admin-metric-pending");
    const elWeight = document.getElementById("admin-metric-weight");

    if (elUsers) elUsers.textContent = metrics.totalUsers;
    if (elDonors) elDonors.textContent = metrics.totalDonors;
    if (elNgos) elNgos.textContent = metrics.totalNgos;
    if (elDonations) elDonations.textContent = metrics.totalDonations;
    if (elPending) elPending.textContent = metrics.pendingVerificationsCount;
    if (elWeight) elWeight.textContent = `${metrics.totalWeightKg} kg`;

    renderVerificationQueue(users);
    renderDonationsAudit(donations);
    renderUsersManagement(users);
    renderActivityFeed(activities);
    drawCharts(donations);
  }

  // Render Verification Queue
  function renderVerificationQueue(users) {
    const container = document.getElementById("verification-queue-tbody");
    if (!container) return;

    const pendingNgos = users.filter(u => u.role === "ngo" && !u.verified);

    if (pendingNgos.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state" style="border:none; padding:2rem 1rem;">
            <p>✓ All registered community organisations have been verified.</p>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = pendingNgos.map(ngo => `
      <tr>
        <td>
          <div style="font-weight:700;">${ngo.organization}</div>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">${ngo.email}</span>
        </td>
        <td><code>${ngo.regNumber || 'NGO-REG-PENDING'}</code></td>
        <td>${ngo.orgType || 'Community Pantry'}</td>
        <td>${ngo.city || 'Metro Central'}</td>
        <td><span class="badge badge-pending">Verification Pending</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-primary btn-sm approve-ngo-btn" data-id="${ngo.id}">
              ${ui.icons.shieldCheck} Approve
            </button>
            <button class="btn btn-outline btn-sm reject-ngo-btn" data-id="${ngo.id}" style="color:#DC2626;">
              Reject
            </button>
          </div>
        </td>
      </tr>
    `).join("");

    container.querySelectorAll(".approve-ngo-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        btn.disabled = true;
        btn.textContent = "Approving...";
        try {
          await api.verifyNGO(id, true);
          ui.showToast("Organisation verification approved. Account granted surplus access.", "success", "NGO Verified");
          await loadAdminData();
        } catch (error) {
          ui.showToast(error.message, "error", "Could Not Verify Organisation");
          btn.disabled = false;
          btn.textContent = "Approve";
        }
      });
    });

    container.querySelectorAll(".reject-ngo-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Reject this organisation verification request?")) {
          try {
            await api.verifyNGO(id, false);
            ui.showToast("Verification request rejected.", "info");
            await loadAdminData();
          } catch (error) {
            ui.showToast(error.message, "error", "Could Not Reject Verification");
          }
        }
      });
    });
  }

  // Render Donations Audit Table
  function renderDonationsAudit(donations) {
    const container = document.getElementById("admin-donations-tbody");
    if (!container) return;

    container.innerHTML = donations.map(d => `
      <tr>
        <td>
          <div style="font-weight:700;">${d.title}</div>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">${d.id} • ${d.category}</span>
        </td>
        <td>${d.donorName}</td>
        <td>${d.quantity} ${d.unit}</td>
        <td>${ui.renderStatusBadge(d.status)}</td>
        <td>${new Date(d.pickupDeadline).toLocaleDateString()}</td>
        <td>
          <div class="table-actions">
            <a href="donation-details.html?id=${d.id}" class="btn btn-outline btn-sm">Inspect</a>
            <button class="btn btn-ghost btn-sm admin-purge-btn" data-id="${d.id}" style="color:#DC2626;">Purge</button>
          </div>
        </td>
      </tr>
    `).join("");

    container.querySelectorAll(".admin-purge-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Purge this donation from the platform?")) {
          try {
            await api.deleteDonation(id);
            ui.showToast("Donation record purged by administrator.", "info");
            await loadAdminData();
          } catch (error) {
            ui.showToast(error.message, "error", "Could Not Remove Donation");
          }
        }
      });
    });
  }

  // Render Users Management Table
  function renderUsersManagement(users) {
    const container = document.getElementById("admin-users-tbody");
    if (!container) return;

    container.innerHTML = users.map(u => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <div style="width:28px; height:28px; border-radius:50%; background:var(--color-primary-50); color:var(--color-primary); font-size:0.75rem; font-weight:700; display:flex; align-items:center; justify-content:center;">
              ${u.avatar || u.name.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:700;">${u.name}</div>
              <span style="font-size:0.75rem; color:var(--color-text-muted);">${u.email}</span>
            </div>
          </div>
        </td>
        <td><span class="category-pill">${u.role.toUpperCase()}</span></td>
        <td>${u.organization || 'Individual'}</td>
        <td>${u.city || 'Metro Central'}</td>
        <td>
          ${u.verified ? '<span class="badge badge-verified">Verified</span>' : '<span class="badge badge-pending">Pending</span>'}
        </td>
      </tr>
    `).join("");
  }

  // Render Activity Log Feed
  function renderActivityFeed(activities) {
    const container = document.getElementById("admin-activity-list");
    if (!container) return;

    container.innerHTML = activities.slice(0, 7).map(a => `
      <div class="activity-item">
        <div class="activity-icon">${ui.icons.clock}</div>
        <div class="activity-content">
          <div class="activity-text">${a.text}</div>
          <div class="activity-time">${a.time}</div>
        </div>
      </div>
    `).join("");
  }

  // Draw Vanilla Canvas Charts
  function drawCharts(donations) {
    // 1. Categories Bar Chart
    const barCanvas = document.getElementById("chart-categories");
    if (barCanvas) {
      const ctx = barCanvas.getContext("2d");
      const cats = {};
      donations.forEach(d => {
        cats[d.category] = (cats[d.category] || 0) + (d.approxWeightKg || 10);
      });

      const labels = Object.keys(cats);
      const values = Object.values(cats);
      const maxValue = Math.max(...values, 10);

      // Canvas dimensions
      const w = barCanvas.width = barCanvas.parentElement.clientWidth || 400;
      const h = barCanvas.height = 220;
      ctx.clearRect(0, 0, w, h);

      const paddingLeft = 40;
      const paddingBottom = 30;
      const chartWidth = w - paddingLeft - 20;
      const chartHeight = h - paddingBottom - 20;

      const barWidth = chartWidth / (labels.length || 1) - 16;

      labels.forEach((label, i) => {
        const val = values[i];
        const barH = (val / maxValue) * chartHeight;
        const x = paddingLeft + i * (barWidth + 16);
        const y = h - paddingBottom - barH;

        // Draw bar
        const grad = ctx.createLinearGradient(0, y, 0, h - paddingBottom);
        grad.addColorStop(0, "#22C55E");
        grad.addColorStop(1, "#1A5336");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barWidth, barH);
        ctx.fill();

        // Draw Value
        ctx.fillStyle = "#526359";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${val}kg`, x + barWidth / 2, y - 6);

        // Draw Label
        ctx.fillText(label.split(" ")[0], x + barWidth / 2, h - 10);
      });
    }

    // 2. Trend Line Chart
    const lineCanvas = document.getElementById("chart-trend");
    if (lineCanvas) {
      const ctx = lineCanvas.getContext("2d");
      const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
      const rescueTrends = [120, 240, 310, 480, 520, 680];
      const maxVal = 800;

      const w = lineCanvas.width = lineCanvas.parentElement.clientWidth || 400;
      const h = lineCanvas.height = 220;
      ctx.clearRect(0, 0, w, h);

      const pad = 40;
      const stepX = (w - pad * 2) / (months.length - 1);
      const chartH = h - pad * 2;

      // Draw Grid Lines
      ctx.strokeStyle = "rgba(128, 128, 128, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const gy = pad + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pad, gy);
        ctx.lineTo(w - pad, gy);
        ctx.stroke();
      }

      // Draw Path
      ctx.beginPath();
      rescueTrends.forEach((val, i) => {
        const x = pad + i * stepX;
        const y = pad + chartH - (val / maxVal) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#1A5336";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Points
      rescueTrends.forEach((val, i) => {
        const x = pad + i * stepX;
        const y = pad + chartH - (val / maxVal) * chartH;
        ctx.fillStyle = "#22C55E";
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Month text
        ctx.fillStyle = "#7E8E85";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(months[i], x, h - 15);
      });
    }
  }

  // Reset Demo Data Button
  const resetBtn = document.getElementById("admin-reset-demo-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      if (confirm("Reset demo data to initial seed state? This restores sample listings, organizations, and requests.")) {
        resetBtn.disabled = true;
        try {
          await api.resetDemoData();
          ui.showToast("Demo data successfully restored.", "success", "Reset Completed");
          setTimeout(() => window.location.reload(), 400);
        } catch (error) {
          ui.showToast(error.message, "error", "Could Not Reset Data");
          resetBtn.disabled = false;
        }
      }
    });
  }

  // Admin Tab Switcher
  const adminTabs = document.querySelectorAll(".admin-nav-tab");
  adminTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      adminTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.getAttribute("data-target");
      document.querySelectorAll(".admin-tab-pane").forEach(pane => {
        pane.style.display = pane.id === target ? "block" : "none";
      });
    });
  });

  try {
    await loadAdminData();
  } catch (error) {
    ui.showToast(error.message, "error", "Could Not Load Admin Data");
  }
});
