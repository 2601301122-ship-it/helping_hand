/**
 * FoodBridge - User & Organization Profile Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  await ui.setupGlobalNavigation("profile");

  const user = await auth.getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Populate fields
  const avatarEl = document.getElementById("profile-avatar-large");
  const nameDisplay = document.getElementById("profile-display-name");
  const roleDisplay = document.getElementById("profile-display-role");
  const orgDisplay = document.getElementById("profile-display-org");

  if (avatarEl) avatarEl.textContent = user.avatar || user.name.slice(0, 2).toUpperCase();
  if (nameDisplay) nameDisplay.textContent = user.name;
  if (roleDisplay) roleDisplay.textContent = `${user.role.toUpperCase()} • ${user.verified ? 'Verified' : 'Pending Verification'}`;
  if (orgDisplay) orgDisplay.textContent = user.organization || "Independent Entity";

  // Form Inputs
  const inputName = document.getElementById("profile-name");
  const inputEmail = document.getElementById("profile-email");
  const inputPhone = document.getElementById("profile-phone");
  const inputOrg = document.getElementById("profile-org");
  const inputOrgType = document.getElementById("profile-org-type");
  const inputCity = document.getElementById("profile-city");
  const inputReg = document.getElementById("profile-reg-number");

  if (inputName) inputName.value = user.name || "";
  if (inputEmail) inputEmail.value = user.email || "";
  if (inputPhone) inputPhone.value = user.phone || "";
  if (inputOrg) inputOrg.value = user.organization || "";
  if (inputOrgType) inputOrgType.value = user.orgType || "";
  if (inputCity) inputCity.value = user.city || "";
  if (inputReg) inputReg.value = user.regNumber || "";

  // Profile Save Form
  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const updates = {
        name: inputName.value.trim(),
        phone: inputPhone.value.trim(),
        organization: inputOrg.value.trim(),
        orgType: inputOrgType.value.trim(),
        city: inputCity.value.trim()
      };

      if (inputReg) {
        updates.regNumber = inputReg.value.trim();
      }

      try {
        await api.updateUser(user.id, updates);
        ui.showToast("Profile details updated successfully!", "success", "Saved");

        if (nameDisplay) nameDisplay.textContent = updates.name;
        if (orgDisplay) orgDisplay.textContent = updates.organization;
      } catch (error) {
        ui.showToast(error.message, "error", "Could Not Save Profile");
      }
    });
  }

  // Reset Demo State Button
  const resetBtn = document.getElementById("profile-reset-demo-btn");
  if (resetBtn) {
    const health = await api.getHealth();
    resetBtn.hidden = user.role !== "admin" || !health.demoMode;
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      if (confirm("Reset demo data to initial defaults? All sample listings will be restored.")) {
        resetBtn.disabled = true;
        try {
          await api.resetDemoData();
          ui.showToast("Demo data reset to default.", "info");
          setTimeout(() => window.location.reload(), 400);
        } catch (error) {
          ui.showToast(error.message, "error", "Could Not Reset Data");
          resetBtn.disabled = false;
        }
      }
    });
  }
});
