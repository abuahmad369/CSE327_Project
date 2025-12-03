/**
 * Supabase project URL.
 * @constant {string}
 */
const supabaseUrl = "https://hgxjuxgxgbjjqxxvafhx.supabase.co";

/**
 * Supabase public anon key.
 * @constant {string}
 */
const supabaseAnonKey = "sb_publishable_RqoNSHsQQOhs8dfL0OXsdA_TfeVyZcn";

/**
 * Supabase client instance.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

/**
 * Key used to store the current user in localStorage.
 * @constant {string}
 */
const ccCurrentUserKey = "cc_currentUser";

/**
 * Cache for elections fetched from Supabase.
 * @type {Array<{id: string, title: string, status: string}>}
 */
let electionsCache = [];

/**
 * Retrieves the current logged-in user from localStorage.
 * @returns {Object|null} The current user object or null if not found.
 */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(ccCurrentUserKey);
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
  localStorage.removeItem(ccCurrentUserKey);
  window.location.href = "../index.html";
}

/**
 * Updates the status message shown on the page.
 * @param {string} message - The message to display.
 * @param {boolean} [isError=false] - If true, display in red color, otherwise green.
 */
function setVoterStatus(message, isError = false) {
  const el = document.getElementById("voterStatus");
  el.style.color = isError ? "crimson" : "green";
  el.textContent = message;
}

/**
 * Renders the list of voters into the HTML table.
 * @param {Array<Object>} voters - Array of voter objects.
 */
function renderVoters(voters) {
  const tbody = document.getElementById("votersBody");
  if (!tbody) return;

  if (!voters || voters.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding:10px; text-align:center; color:#6b7280;">
          এখনো কোনো ভোটার নিবন্ধিত নেই।
        </td>
      </tr>
    `;
    return;
  }

  const rowsHtml = voters.map(voter => {
    const name = voter.user?.name || "নাম নেই";
    const email = voter.user?.email || "";
    const studentId = voter.student_id || "";
    const approvedChecked = voter.is_approved ? "checked" : "";
    const bannedChecked = voter.is_banned ? "checked" : "";
    const electionId = voter.election_id || "";

    const optionsHtml = [
      '<option value="">নির্বাচন নির্বাচন করুন</option>',
      ...electionsCache.map(election => {
        const title = election.title || "(শিরোনাম নেই)";
        const selected = election.id === electionId ? "selected" : "";
        return `<option value="${election.id}" ${selected}>${title}</option>`;
      })
    ].join("");

    return `
      <tr data-id="${voter.id}">
        <td style="padding:8px;">${name}</td>
