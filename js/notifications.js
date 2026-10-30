/**
 * FoodBridge - In-App Notification Centre
 * Manages notification queue, bell badge, and notification drawer
 */

const notificationSystem = {
  // Get notifications from localStorage
  getNotifications() {
    const raw = localStorage.getItem('foodbridge_notifications');
    return raw ? JSON.parse(raw) : [];
  },

  // Save notifications
  saveNotifications(notifications) {
    localStorage.setItem('foodbridge_notifications', JSON.stringify(notifications));
  },

  // Add a new notification
  addNotification(title, message, type = 'info', link = null) {
    const notifications = this.getNotifications();
    const newNotif = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type, // 'info', 'success', 'warning', 'request', 'verification'
      link,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    // Keep max 25 notifications
    this.saveNotifications(notifications.slice(0, 25));
    this.updateBadge();
    return newNotif;
  },

  // Mark as read
  markRead(id) {
    const notifications = this.getNotifications();
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) notifications[idx].read = true;
    this.saveNotifications(notifications);
    this.updateBadge();
  },

  // Mark all read
  markAllRead() {
    const notifications = this.getNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(notifications);
    this.updateBadge();
  },

  // Delete a notification
  deleteNotification(id) {
    const notifications = this.getNotifications().filter(n => n.id !== id);
    this.saveNotifications(notifications);
    this.updateBadge();
  },

  // Count unread
  getUnreadCount() {
    return this.getNotifications().filter(n => !n.read).length;
  },

  // Update badge on bell icon
  updateBadge() {
    const count = this.getUnreadCount();
    const badges = document.querySelectorAll('.notif-badge');
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  },

  // Seed demo notifications for prototype
  seedDemoNotifications(userRole) {
    const existing = this.getNotifications();
    if (existing.length > 0) {
      this.updateBadge();
      return;
    }

    const demoNotifs = {
      donor: [
        { title: 'New Collection Request', message: 'Hope Harbor Community Shelter requested your Gourmet Buffet listing (FB-DON-101).', type: 'request', link: 'donor-dashboard.html' },
        { title: 'Food Rescued Successfully!', message: '140 Bottles of Juice were collected by Hope Harbor on 29 Oct. Great impact!', type: 'success', link: 'donor-dashboard.html' },
        { title: 'Listing Expiring Soon', message: 'Your Mediterranean Mezze listing (FB-DON-104) expires in 2 hours. Check for pending requests.', type: 'warning', link: 'donation-details.html?id=FB-DON-104' }
      ],
      ngo: [
        { title: 'Request Accepted!', message: 'Green Roots Bistro accepted your request for Mediterranean Mezze Bowls. Pickup dock: Alley Entrance.', type: 'success', link: 'ngo-dashboard.html' },
        { title: 'New Surplus Food Available', message: '110 meal portions of Dal & Rice just posted by Campus Hall Dining - University District!', type: 'info', link: 'browse.html' },
        { title: 'Verification Status Update', message: 'Your organisation registration is under review. Admin decision expected within 24 hours.', type: 'verification', link: 'ngo-dashboard.html' }
      ],
      admin: [
        { title: 'New NGO Verification Request', message: 'Feed The Light Outreach has submitted documents for community organisation accreditation.', type: 'verification', link: 'admin-dashboard.html' },
        { title: 'Platform Milestone!', message: 'FoodBridge has now facilitated rescue of over 500kg of surplus food this month!', type: 'success', link: 'admin-dashboard.html' },
        { title: 'Expired Listing Detected', message: '3 listings passed their collection deadline without pickup. Consider outreach to donors.', type: 'warning', link: 'admin-dashboard.html' }
      ]
    };

    const notifs = demoNotifs[userRole] || demoNotifs.donor;
    notifs.forEach(n => {
      const notifications = this.getNotifications();
      notifications.push({
        id: `notif_${Date.now()}_${Math.random()}`,
        ...n,
        read: false,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
      this.saveNotifications(notifications);
    });
    this.updateBadge();
  },

  // Format relative time
  formatRelativeTime(isoString) {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  },

  // Get type icon
  getTypeIcon(type) {
    const icons = {
      success: '✅',
      info: '📢',
      warning: '⚠️',
      request: '📩',
      verification: '🛡️'
    };
    return icons[type] || '📢';
  },

  // Render notification drawer content
  renderDrawer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const notifications = this.getNotifications();
    const unread = notifications.filter(n => !n.read).length;

    if (notifications.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:2rem 1rem;">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">🔔</div>
          <h4 style="margin-bottom:0.3rem;">No notifications yet</h4>
          <p style="font-size:0.85rem; color:var(--color-text-muted);">
            Surplus rescue activity will appear here.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; border-bottom:1px solid var(--color-border);">
        <h3 style="font-size:1rem; font-weight:700; margin:0;">
          Notifications ${unread > 0 ? `<span style="background:var(--color-accent); color:#fff; font-size:0.7rem; padding:0.1rem 0.4rem; border-radius:99px; margin-left:0.35rem;">${unread}</span>` : ''}
        </h3>
        <button onclick="notificationSystem.markAllRead(); notificationSystem.renderDrawer('${containerId}');" 
                style="font-size:0.78rem; color:var(--color-primary); font-weight:600; background:none; border:none; cursor:pointer;">
          Mark all read
        </button>
      </div>
      <div style="overflow-y:auto; max-height:380px;">
        ${notifications.map(n => `
          <div style="
            display:flex; gap:0.85rem; padding:0.9rem 1.25rem;
            border-bottom:1px solid var(--color-border-light);
            background:${n.read ? 'transparent' : 'var(--color-primary-50)'};
            cursor:pointer;
            transition:background 0.2s;
          " 
          onclick="notificationSystem.markRead('${n.id}'); ${n.link ? `window.location.href='${n.link}'` : `notificationSystem.renderDrawer('${containerId}')`};"
          onmouseover="this.style.background='var(--color-surface-soft)'"
          onmouseout="this.style.background='${n.read ? 'transparent' : 'var(--color-primary-50)'}'">
            <div style="font-size:1.3rem; flex-shrink:0; margin-top:0.1rem;">${this.getTypeIcon(n.type)}</div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:0.88rem; font-weight:${n.read ? '500' : '700'}; color:var(--color-text); margin-bottom:0.2rem; line-height:1.3;">
                ${n.title}
              </div>
              <div style="font-size:0.8rem; color:var(--color-text-muted); line-height:1.4; margin-bottom:0.25rem;">
                ${n.message}
              </div>
              <div style="font-size:0.72rem; color:var(--color-text-light);">
                ${this.formatRelativeTime(n.createdAt)}
              </div>
            </div>
            <button onclick="event.stopPropagation(); notificationSystem.deleteNotification('${n.id}'); notificationSystem.renderDrawer('${containerId}');" 
                    style="color:var(--color-text-light); background:none; border:none; cursor:pointer; padding:0.2rem; flex-shrink:0; align-self:flex-start; font-size:1rem;"
                    title="Dismiss">×</button>
          </div>
        `).join('')}
      </div>
    `;
  },

  // Initialize the notification bell in the navbar
  initBell(userRole) {
    this.seedDemoNotifications(userRole);

    // Find notification bell containers and set them up
    const bells = document.querySelectorAll('.notif-bell-wrapper');
    bells.forEach(wrapper => {
      const drawerId = wrapper.getAttribute('data-drawer') || 'notif-drawer';
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        const drawer = document.getElementById(drawerId);
        if (!drawer) return;
        this.renderDrawer(drawerId);
        drawer.classList.toggle('active');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.notif-drawer.active').forEach(d => d.classList.remove('active'));
    });

    this.updateBadge();
  }
};
