/**
 * Local storage key used for storing the current logged in user.
 * @type {string}
 */
const CC_CURRENT_USER_KEY = "cc_currentUser";

/**
 * Retrieves the current user from localStorage.
 * Safely parses JSON and returns null if parsing fails or data is missing.
 * @returns {object|null} The current user object or null if unavailable.
 */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CC_CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Ensures the logged-in user exists and is a voter.
 * Redirects to the login page if the user is not valid.
 * @returns {object|null} The voter user object if valid, otherwise null.
 */
function ensureVoterUser() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login/login.html";
    return null;
  }
  if (user.role !== "voter") {
    alert("শুধুমাত্র ভোটার প্রোফাইল এখানে দেখা যাবে।");
    window.location.href = "login/login.html";
    return null;
  }
  return user;
}

/**
 * Initializes the voter profile page.
 * Loads user data from storage, populates profile fields and handles logout.
 * @returns {void}
 */
(function initProfilePage() {
  const user = ensureVoterUser();
  if (!user) return;

  const name = user.name || "নাম পাওয়া যায়নি";
  const email = user.email || "ইমেইল পাওয়া যায়নি";

  document.getElementById("profileName").textContent = name;
  document.getElementById("profileEmail").textContent = email;
  document.getElementById("profileRole").textContent = "ভোটার";

  const titleEl = document.getElementById("profileTitle");
  if (titleEl) {
    titleEl.textContent = name + " – আপনার প্রোফাইল";
  }

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(CC_CURRENT_USER_KEY);
    window.location.href = "login/login.html";
  });
})();
