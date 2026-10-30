/**
 * FoodBridge - Food Impact Calculator
 * Estimates social and environmental impact of food donations
 * All calculations are clearly labeled as estimates with disclosed assumptions.
 */

const impactCalculator = {
  // Conversion assumptions (documented and disclosed)
  ASSUMPTIONS: {
    kgPerMeal: 0.45,       // Average 450g of food per meal serving
    co2PerKg: 2.5,         // ~2.5 kg CO2e per kg food rescued (vs landfill methane)
    waterPerKg: 1000,      // ~1000 litres of water embedded per kg food
    moneyPerKg: 3.5,       // Approximate retail value USD per kg
    landPerKg: 1.8         // Square metres of farmland used per kg produced
  },

  calculate(totalWeightKg) {
    const kg = Number(totalWeightKg) || 0;
    return {
      weightKg: kg,
      estimatedMeals: Math.round(kg / this.ASSUMPTIONS.kgPerMeal),
      co2SavedKg: Math.round(kg * this.ASSUMPTIONS.co2PerKg),
      waterSavedLitres: Math.round(kg * this.ASSUMPTIONS.waterPerKg),
      monetarySavedUSD: Math.round(kg * this.ASSUMPTIONS.moneyPerKg),
      landSavedSqm: Math.round(kg * this.ASSUMPTIONS.landPerKg)
    };
  },

  // Render impact stats into a container
  async renderImpactPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const metrics = await api.getMetrics();
    const impact = this.calculate(metrics.rescuedWeightKg);

    container.innerHTML = `
      <div style="background:linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 100%); border-radius:var(--radius-xl); padding:2.5rem; color:#FFFFFF; margin-bottom:2rem;">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
          <span style="font-size:1.5rem;">🌍</span>
          <h3 style="color:#FFFFFF; font-size:1.4rem; margin:0;">FoodBridge Collective Impact</h3>
        </div>
        <p style="color:#C2D6CA; font-size:0.85rem; margin-bottom:2rem;">
          Based on ${impact.weightKg} kg of food recorded as collected or completed. Estimates use documented assumptions below.
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:1.25rem;">
          ${this._metricCard('🍽️', impact.estimatedMeals.toLocaleString(), 'Estimated Meals', 'community beneficiaries')}
          ${this._metricCard('🌱', `${impact.co2SavedKg} kg`, 'CO₂ Prevented', 'vs. landfill methane')}
          ${this._metricCard('💧', `${(impact.waterSavedLitres/1000).toFixed(1)}K L`, 'Water Embedded', 'in rescued food')}
          ${this._metricCard('💰', `\$${impact.monetarySavedUSD}`, 'Food Value', 'approximate retail')}
        </div>

        <div style="margin-top:1.75rem; padding:1rem; background:rgba(255,255,255,0.08); border-radius:var(--radius-md); font-size:0.78rem; color:#A7F3D0; border:1px solid rgba(255,255,255,0.12);">
          📊 <strong>Calculation Assumptions (Disclosed):</strong> ${impact.weightKg}kg × 
          0.45kg/meal = ${impact.estimatedMeals} meals | ×2.5 CO₂e factor = ${impact.co2SavedKg}kg CO₂ | 
          ×1000L/kg = ${impact.waterSavedLitres.toLocaleString()}L water. 
          These are industry-average estimates, not independently measured data.
        </div>
      </div>
    `;
  },

  _metricCard(emoji, value, label, sub) {
    return `
      <div style="background:rgba(255,255,255,0.1); border-radius:var(--radius-lg); padding:1.25rem; backdrop-filter:blur(8px);">
        <div style="font-size:1.5rem; margin-bottom:0.35rem;">${emoji}</div>
        <div style="font-size:1.6rem; font-weight:800; color:#FFFFFF; line-height:1.1; margin-bottom:0.2rem;">${value}</div>
        <div style="font-size:0.82rem; font-weight:700; color:#A7F3D0;">${label}</div>
        <div style="font-size:0.72rem; color:#7EBD97;">${sub}</div>
      </div>
    `;
  },

  // Render a personal impact for a single donor
  renderDonorImpact(containerId, donorWeightKg) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const impact = this.calculate(donorWeightKg);

    container.innerHTML = `
      <div class="card" style="border-left:5px solid var(--color-accent);">
        <h4 style="font-size:1.1rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
          🌱 Your Personal Impact Summary
        </h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.85rem;">
          <div style="text-align:center; padding:0.75rem; background:var(--color-surface-soft); border-radius:var(--radius-md);">
            <div style="font-size:1.35rem; font-weight:800; color:var(--color-primary);">${impact.estimatedMeals}</div>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">Meals Enabled</div>
          </div>
          <div style="text-align:center; padding:0.75rem; background:var(--color-surface-soft); border-radius:var(--radius-md);">
            <div style="font-size:1.35rem; font-weight:800; color:var(--color-accent);">${impact.co2SavedKg} kg</div>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">CO₂ Averted</div>
          </div>
          <div style="text-align:center; padding:0.75rem; background:var(--color-surface-soft); border-radius:var(--radius-md);">
            <div style="font-size:1.35rem; font-weight:800; color:#3B82F6;">${(impact.waterSavedLitres/1000).toFixed(1)}K L</div>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">Water Embodied</div>
          </div>
        </div>
        <p style="font-size:0.75rem; color:var(--color-text-light); margin:0.75rem 0 0; font-style:italic;">
          * Estimated using industry averages. Not independently audited data.
        </p>
      </div>
    `;
  }
};
