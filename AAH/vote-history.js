/**
 * Gets the currently logged in user from localStorage.
 * @returns {object|null} Parsed user object or null if not found or invalid.
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
 * Ensures the current user exists and is a voter.
 * Redirects to login page if invalid.
 * @returns {object|null} User object if valid, otherwise null.
 */
function ensureVoterUser() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login/login.html";
    return null;
  }
  if (user.role !== "voter") {
    alert("এই ইতিহাস শুধুমাত্র ভোটারদের জন্য।");
    window.location.href = "login/login.html";
    return null;
  }
  return user;
}

/**
 * Loads vote history for a specific user.
 * @param {object} user The current voter user.
 * @param {string|number} user.id The unique user ID used for filtering history.
 * @returns {Array<object>} Filtered list of vote history entries.
 */
function loadHistory(user) {
  try {
    const raw = localStorage.getItem(CC_VOTE_HISTORY_KEY) || "[]";
    const list = JSON.parse(raw);
    return list.filter(entry => entry.userId === user.id);
  } catch (e) {
    console.warn("vote history পড়তে সমস্যা:", e);
    return [];
  }
}

/**
 * Formats an ISO timestamp string into a readable time for bn-BD locale.
 * @param {string} iso ISO formatted timestamp.
 * @returns {string} Localized human readable date and time.
 */
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("bn-BD");
}

/**
 * Initializes the history page and populates vote history for the current user.
 * No parameters are needed since it reads from the DOM and storage.
 * @returns {void}
 */
(function initHistoryPage() {
  const user = ensureVoterUser();
  if (!user) return;

  const statusEl = document.getElementById("historyStatus");
  const bodyEl = document.getElementById("historyBody");
  if (!statusEl || !bodyEl) return;

  const rows = loadHistory(user);

  if (!rows.length) {
    statusEl.textContent =
      "এই ব্রাউজারে আপনার কোনো ভোট ইতিহাস পাওয়া যায়নি। নতুন করে ভোট দিলে এই তালিকা আপডেট হবে।";
    bodyEl.innerHTML = "";
    return;
  }

  rows.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  statusEl.textContent = `মোট ${rows.length} টি ভোট রেকর্ড দেখানো হচ্ছে।`;

  bodyEl.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");

    const tdElection = document.createElement("td");
    tdElection.style.padding = "6px 8px";
    tdElection.style.borderBottom = "1px solid var(--border)";
    tdElection.textContent = r.electionTitle || r.electionId;

    const tdCandidate = document.createElement("td");
    tdCandidate.style.padding = "6px 8px";
    tdCandidate.style.borderBottom = "1px solid var(--border)";
    tdCandidate.textContent = r.candidateName || r.candidateId;

    const tdTime = document.createElement("td");
    tdTime.style.padding = "6px 8px";
    tdTime.style.borderBottom = "1px solid var(--border)";
    tdTime.textContent = formatTime(r.timestamp);

    tr.appendChild(tdElection);
    tr.appendChild(tdCandidate);
    tr.appendChild(tdTime);
    bodyEl.appendChild(tr);
  });
})();
