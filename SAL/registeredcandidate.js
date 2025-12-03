/**
 * Supabase project URL.
 * @constant {string}
 */
const SUPABASE_URL = "https://hgxjuxgxgbjjqxxvafhx.supabase.co";

/**
 * Supabase public anon key.
 * @constant {string}
 */
const SUPABASE_ANON_KEY = "sb_publishable_RqoNSHsQQOhs8dfL0OXsdA_TfeVyZcn";

/**
 * Supabase client instance.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Key used to store the current user in localStorage.
 * @constant {string}
 */
const CC_CURRENT_USER_KEY = "cc_currentUser";

/**
 * Cache for elections fetched from Supabase.
 * @type {Array<{id: string, title: string, status: string}>}
 */
let ELECTIONS_CACHE = [];

/**
 * Retrieves the current logged-in user from localStorage.
 * @returns {Object|null} The current user object or null if not found.
 */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CC_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse current user", e);
    return null;
  }
}

/**
 * Ensures that the current user is a supervisor.
 * If not, redirects to login page.
 * @returns {Object|null} The current supervisor user or null if not allowed.
 */
function ensureSupervisor() {
  const user = getCurrentUser();
  if (!user || user.role !== "supervisor") {
    alert("শুধুমাত্র সুপারভাইজার এই পেজে প্রবেশ করতে পারবেন।");
    window.location.href = "../login/login.html";
    return null;
  }
  return user;
}

/**
 * Logs out the current user and redirects to home page.
 */
function logout() {
  localStorage.removeItem(CC_CURRENT_USER_KEY);
  window.location.href = "../index.html";
}

/**
 * Updates the status message shown on the page.
 * @param {string} message - The message to display.
 * @param {boolean} [isError=false] - If true, display in red color, otherwise green.
 */
function setStatus(message, isError = false) {
  const el = document.getElementById("candStatus");
  el.style.color = isError ? "crimson" : "green";
  el.textContent = message;
}

/**
 * Renders the list of candidates into the HTML table.
 * @param {Array<Object>} candidates - Array of candidate objects.
 */
function renderCandidates(candidates) {
  const tbody = document.getElementById("candidatesBody");
  if (!tbody) return;

  if (!candidates || candidates.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="padding:10px; text-align:center; color:#6b7280;">
          এখনো কোনো প্রার্থী নিবন্ধিত নেই।
        </td>
      </tr>
    `;
    return;
  }

  const rowsHtml = candidates.map(c => {
    const name = c.user?.name || "নাম নেই";
    const email = c.user?.email || "";
    const approvedChecked = c.is_approved ? "checked" : "";
    const electionId = c.election_id || "";

    const optionsHtml = [
      '<option value="">নির্বাচন নির্বাচন করুন</option>',
      ...ELECTIONS_CACHE.map(e => {
        const title = e.title || "(শিরোনাম নেই)";
        const selected = e.id === electionId ? "selected" : "";
        return `<option value="${e.id}" ${selected}>${title}</option>`;
      })
    ].join("");

    return `
      <tr data-id="${c.id}">
        <td style="padding:8px;">${name}</td>
        <td style="padding:8px;">${email}</td>
        <td style="padding:8px; min-width:180px;">
          <select class="election-select" style="width:100%; padding:6px; border-radius:6px; border:1px solid var(--border);">
            ${optionsHtml}
          </select>
        </td>
        <td style="padding:8px; text-align:center;">
          <input type="checkbox" class="approved-checkbox" ${approvedChecked} />
        </td>
        <td style="padding:8px; text-align:center;">
          <button type="button"
                  onclick="saveCandidate('${c.id}')"
                  style="padding:6px 12px; border-radius:6px; border:none; background:var(--brand); color:#fff; font-size:13px; cursor:pointer;">
            সংরক্ষণ
          </button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rowsHtml;
}

/**
 * Loads elections and candidates from Supabase and renders them.
 */
async function loadCandidatesPage() {
  const user = ensureSupervisor();
  if (!user) return;

  setStatus("প্রার্থীদের তথ্য লোড হচ্ছে...");

  // Load elections
  const { data: elections, error: electionsError } = await supabase
    .from("elections")
    .select("id, title, status")
    .order("created_at", { ascending: false });

  if (electionsError) {
    console.error("Elections error:", electionsError);
    setStatus("elections টেবিল থেকে ডাটা আনতে সমস্যা হচ্ছে।", true);
    ELECTIONS_CACHE = [];
  } else {
    ELECTIONS_CACHE = elections || [];
  }

  // Load candidates
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select(`
      id,
      is_approved,
      election_id,
      user:users (
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (candidatesError) {
    console.error("Candidates error:", candidatesError);
    setStatus("candidates টেবিল থেকে ডাটা আনতে সমস্যা হচ্ছে।", true);
    return;
  }

  renderCandidates(candidates);
  setStatus("প্রার্থীদের তথ্য লোড সম্পন্ন হয়েছে।", false);
}

/**
 * Saves changes made to a candidate's election or approval status.
 * @param {string} id - The candidate ID to update.
 */
async function saveCandidate(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const select = row.querySelector(".election-select");
  const checkbox = row.querySelector(".approved-checkbox");

  const electionId = select.value || null;
  const approved = checkbox.checked;

  setStatus("প্রার্থীর তথ্য সংরক্ষণ হচ্ছে...");

  const { error } = await supabase
    .from("candidates")
    .update({
      election_id: electionId,
      is_approved: approved
    })
    .eq("id", id);

  if (error) {
    console.error("Update candidate error:", error);
    setStatus("সংরক্ষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", true);
    return;
  }

  setStatus("প্রার্থীর তথ্য সফলভাবে সংরক্ষিত হয়েছে।", false);
  loadCandidatesPage();
}

// Expose functions to global scope
window.saveCandidate = saveCandidate;
window.logout = logout;

// Initialize page
loadCandidatesPage();
