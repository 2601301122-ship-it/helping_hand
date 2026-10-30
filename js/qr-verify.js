/**
 * FoodBridge - QR Collection Verification System
 * 
 * Generates a unique time-limited collection verification token displayed as a QR pattern.
 * The actual verification must be cryptographically secured on the Flask backend.
 * This frontend-only implementation is a VISUAL PROTOTYPE for demonstration purposes.
 */

const qrVerify = {
  // Generate a demo verification token
  generateToken(donationId, ngoId) {
    const timestamp = Date.now();
    const raw = `FB-${donationId}-${ngoId}-${timestamp}`;
    // In production: server-generated HMAC token, not client-side
    return btoa(raw).replace(/[^A-Z0-9]/gi, '').substring(0, 16).toUpperCase();
  },

  // Generate a visual QR-like pattern using CSS grid (demo, not a real QR standard)
  generateQRPattern(token) {
    const size = 9; // 9x9 grid
    const cells = [];
    let seed = 0;
    for (let i = 0; i < token.length; i++) seed += token.charCodeAt(i);

    // Deterministic pseudorandom fill based on token
    function pseudoRand(i, j) {
      const val = (seed * 31 + i * 17 + j * 13) % 100;
      return val < 55;
    }

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Corner finder patterns (always filled for QR-like look)
        const isCorner = (
          (row < 3 && col < 3) ||
          (row < 3 && col >= size - 3) ||
          (row >= size - 3 && col < 3)
        );
        cells.push({ row, col, filled: isCorner || pseudoRand(row, col) });
      }
    }

    return cells;
  },

  // Render QR verification card into a container
  renderVerificationCard(containerId, donationId, ngoId, donationTitle) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const token = this.generateToken(donationId, ngoId);
    const cells = this.generateQRPattern(token);
    const size = 9;
    const cellSize = 22;

    const gridCells = cells.map(c => `
      <div style="
        width:${cellSize}px; height:${cellSize}px;
        background:${c.filled ? '#131E18' : '#FFFFFF'};
        border-radius:${c.filled ? '3px' : '0'};
      "></div>
    `).join('');

    // Token expires in 4 hours from now
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const expiresStr = expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    container.innerHTML = `
      <div class="card" style="text-align:center; max-width:380px; margin:0 auto;">
        <div style="background:var(--color-surface-soft); padding:0.4rem 0.85rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.4rem; font-size:0.75rem; font-weight:700; color:var(--color-primary); margin-bottom:1rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          FoodBridge Collection Verification Token
        </div>

        <h3 style="font-size:1.15rem; margin-bottom:0.3rem; line-height:1.3;">${donationTitle || 'Food Donation Pickup'}</h3>
        <p style="font-size:0.82rem; color:var(--color-text-muted); margin-bottom:1.5rem;">
          Present this token to the kitchen coordinator at the loading dock for handover verification.
        </p>

        <!-- QR Pattern Grid -->
        <div style="display:inline-block; padding:14px; background:#FFFFFF; border-radius:var(--radius-lg); border:2px solid var(--color-border); box-shadow:var(--shadow-md); margin-bottom:1rem;">
          <div style="display:grid; grid-template-columns:repeat(${size}, ${cellSize}px); gap:2px;">
            ${gridCells}
          </div>
        </div>

        <!-- Token Text -->
        <div style="background:var(--color-surface-soft); border-radius:var(--radius-md); padding:0.85rem; margin-bottom:1.25rem; font-family:monospace; letter-spacing:0.15em; font-size:1.1rem; font-weight:700; color:var(--color-text);">
          ${token.match(/.{1,4}/g).join('-')}
        </div>

        <div style="background:#FEF3C7; border:1px solid #FCD34D; border-radius:var(--radius-md); padding:0.75rem; margin-bottom:1rem; font-size:0.82rem; color:#92400E; text-align:left;">
          ⚠️ <strong>Demo Verification Notice:</strong> This is a visual-only demo token. Server-generated QR verification is not implemented; do not use this code to authorize a handover.
        </div>

        <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--color-text-muted);">
          <span>🕐 Valid until: <strong>${expiresStr} today</strong></span>
          <span>📋 Ref: <code>${donationId}</code></span>
        </div>
      </div>
    `;
  },

  // Show QR verification modal
  showVerificationModal(donationId, ngoId, donationTitle) {
    let modal = document.getElementById('qr-verify-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'qr-verify-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-card" style="max-width:460px;">
          <div class="modal-header">
            <h3 class="modal-title">Collection Verification QR Token</h3>
            <button class="modal-close-btn btn-icon" onclick="document.getElementById('qr-verify-modal').classList.remove('active'); document.body.style.overflow=''">&times;</button>
          </div>
          <div class="modal-body" id="qr-verify-content"></div>
        </div>
      `;
      document.body.appendChild(modal);

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    this.renderVerificationCard('qr-verify-content', donationId, ngoId, donationTitle);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};
