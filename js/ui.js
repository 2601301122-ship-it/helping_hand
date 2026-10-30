/**
 * FoodBridge - UI Framework & Component Utilities
 */

const ui = {
  // SVG Icon Library
  icons: {
    leaf: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
    heart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
    clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    mapPin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    shieldCheck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 22 4"/></svg>`,
    alertTriangle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
    search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    box: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    truck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
  },

  // Toast Notification System
  showToast(message, type = "info", title = "") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const titles = {
      success: title || "Success",
      error: title || "Attention",
      warning: title || "Notice",
      info: title || "Information"
    };

    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss">&times;</button>
    `;

    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  },

  // Modal Dialogs
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  initModals() {
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
          document.body.style.overflow = "";
        }
      });
      const closeBtn = overlay.querySelector(".modal-close-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          overlay.classList.remove("active");
          document.body.style.overflow = "";
        });
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(modal => {
          modal.classList.remove("active");
          document.body.style.overflow = "";
        });
      }
    });
  },

  // Theme Management (Light / Dark)
  initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    
    this.setTheme(savedTheme);

    const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        this.setTheme(newTheme);
      });
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
    toggleBtns.forEach(btn => {
      btn.innerHTML = theme === "dark" ? this.icons.sun : this.icons.moon;
      btn.setAttribute("title", `Switch to ${theme === "dark" ? "Light" : "Dark"} mode`);
    });
  },

  // Status Badge Markup
  renderStatusBadge(status) {
    const s = (status || "Available").toLowerCase();
    return `<span class="badge badge-${s}"><span class="badge-dot"></span>${status}</span>`;
  },

  // Time remaining countdown formatter
  formatTimeRemaining(deadlineStr) {
    if (!deadlineStr) return "N/A";
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline - now;

    if (diffMs <= 0) {
      return `<span style="color:#EF4444; font-weight:700;">Expired</span>`;
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 2) {
      return `<span style="color:#DC2626; font-weight:700;">Urgent: ${diffHours}h ${diffMins}m left</span>`;
    }
    if (diffHours < 24) {
      return `<span>${diffHours}h ${diffMins}m remaining</span>`;
    }
    const days = Math.floor(diffHours / 24);
    return `<span>${days}d ${diffHours % 24}h remaining</span>`;
  },

  // Setup global navigation and enforce dashboard roles in the browser UI.
  async setupGlobalNavigation(activePage = "") {
    this.initTheme();
    this.initModals();

    const user = await auth.getCurrentUser();

    const requiredRole = {
      "donor-dashboard": "donor",
      "ngo-dashboard": "ngo",
      "admin-dashboard": "admin"
    }[activePage];
    if (["donor-dashboard", "ngo-dashboard", "admin-dashboard", "profile"].includes(activePage) &&
        !user) {
      window.location.href = "login.html";
      return null;
    }
    if (requiredRole && user && user.role !== requiredRole) {
      window.location.href = {
        donor: "donor-dashboard.html",
        ngo: "ngo-dashboard.html",
        admin: "admin-dashboard.html"
      }[user.role] || "index.html";
      return null;
    }

    // Populate user menu if present
    const userTrigger = document.querySelector(".user-menu-trigger");
    const userDropdown = document.querySelector(".user-dropdown-menu");

    if (userTrigger && userDropdown && user) {
      const avatarEl = userTrigger.querySelector(".user-avatar");
      const nameEl = userTrigger.querySelector(".user-name");
      const roleEl = userTrigger.querySelector(".user-role-badge");

      if (avatarEl) avatarEl.textContent = user.avatar || user.name.slice(0, 2).toUpperCase();
      if (nameEl) nameEl.textContent = user.name;
      if (roleEl) roleEl.textContent = user.role.toUpperCase();

      userTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("active");
      });

      document.addEventListener("click", (e) => {
        if (!userDropdown.contains(e.target) && !userTrigger.contains(e.target)) {
          userDropdown.classList.remove("active");
        }
      });
    }

    if (user) {
      document.querySelectorAll('.user-dropdown-menu a[href="login.html"], a[data-logout]').forEach(link => {
        link.addEventListener("click", event => {
          event.preventDefault();
          auth.logout().catch(error => {
            console.error(error);
            ui.showToast(error.message, "error", "Could Not Sign Out");
          });
        });
      });
    }

    // Mobile nav toggle
    const mobileToggle = document.querySelector(".mobile-nav-toggle");
    const mobileDrawer = document.querySelector(".mobile-drawer");
    const mobileDrawerClose = document.querySelector(".mobile-drawer-close");

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener("click", () => {
        mobileDrawer.classList.add("active");
      });
    }

    if (mobileDrawerClose && mobileDrawer) {
      mobileDrawerClose.addEventListener("click", () => {
        mobileDrawer.classList.remove("active");
      });
    }

    if (mobileDrawer) {
      mobileDrawer.addEventListener("click", (e) => {
        if (e.target === mobileDrawer) {
          mobileDrawer.classList.remove("active");
        }
      });
    }
    return user;
  }
};
