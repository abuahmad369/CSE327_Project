/**
 * Supabase project URL.
 * @type {string}
 */
const SUPABASE_URL = "https://hgxjuxgxgbjjqxxvafhx.supabase.co";

/**
 * Supabase public anon key.
 * @type {string}
 */
const SUPABASE_ANON_KEY = "sb_publishable_RqoNSHsQQOhs8dfL0OXsdA_TfeVyZcn";

/**
 * Supabase client instance.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * LocalStorage key for the logged in user.
 * @type {string}
 */
const CC_CURRENT_USER_KEY = "cc_currentUser";

/**
 * Retrieves the currently logged in user from localStorage.
 * Safely parses JSON and returns null if invalid or absent.
 * @returns {object|null} The user object or null if missing.
 */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CC_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Ensures the current user exists and is a voter.
 * Redirects to login page if invalid.
 * @returns {object|null} Voter user object or null if redirected.
 */
function requireVoter() {
  const user = getCurrentUser();
  if (!user || user.role !== "voter") {
    window.location.href = "/login/login.html";
    return null;
  }
  return user;
}

/**
 * Converts election status value to a readable Bangla label.
 * @param {string} status Raw status from database.
 * @returns {string} Human readable formatted status.
 */
function shortStatus(status) {
  if (!status) return "অজানা";
  if (status === "active") return "চলমান";
  if (status === "closed") return "সমাপ্ত";
  return status;
}

/**
 * Returns the background color used for status badges.
 * @param {string} status Election status text.
 * @returns {string} CSS color code.
 */
function badgeColor(status) {
  if (status === "active") return "#dcfce7";
  if (status === "closed") return "#fee2e2";
  return "#e5e7eb";
}

/**
 * Loads the voter dashboard.
 * Fetches elections, user voting history and renders election cards.
 * @async
 * @returns {Promise<void>}
 */
async function loadVoterDashboard() {
  const user = requireVoter();
  if (!user) return;

  const nameEl = document.getElementById("voterName");
  if (nameEl) nameEl.textContent = user.name || "ভোটার";

  const statusEl = document.getElementById("voterStatus");
  const container = document.getElementById("electionsContainer");

  if (!statusEl || !container) return;

  statusEl.textContent = "নির্বাচনের তথ্য লোড হচ্ছে...";
  container.innerHTML = "";

  try {
    const { data: elections, error: eErr } = await supabase
      .from("elections")
      .select("*")
      .order("start_at", { ascending: true });

    if (eErr) throw eErr;

    const { data: votes, error: vErr } = await supabase
      .from("votes")
      .select("election_id")
      .eq("voter_id", user.id);

    if (vErr) throw vErr;

    const votedSet = new Set((votes || []).map(v => v.election_id));

    if (!elections || !elections.length) {
      statusEl.textContent = "এখনো কোনো নির্বাচন তৈরি করা হয়নি।";
      return;
    }

    statusEl.textContent = `মোট ${elections.length} টি নির্বাচন পাওয়া গেছে।`;

    elections.forEach(e => {
      const card = document.createElement("div");
      card.style.border = "1px solid var(--border)";
      card.style.borderRadius = "12px";
      card.style.padding = "12px 14px";
      card.style.backgroundColor = "#f9fafb";

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "flex-start";
      header.style.marginBottom = "4px";

      const left = document.createElement("div");
      const titleP = document.createElement("p");
      titleP.style.margin = "0 0 2px";
      titleP.style.fontWeight = "700";
      titleP.textContent = e.title || "নির্বাচনের নাম নেই";

      const subP = document.createElement("p");
      subP.style.margin = "0";
      subP.style.fontSize = "13px";
      subP.style.color = "#4b5563";

      const start = e.start_at ? new Date(e.start_at).toLocaleString() : "শুরু নির্ধারিত নয়";
      const end = e.end_at ? new Date(e.end_at).toLocaleString() : "শেষ নির্ধারিত নয়";
      subP.textContent = `${start} থেকে ${end}`;

      left.appendChild(titleP);
      left.appendChild(subP);

      const pill = document.createElement("span");
      pill.textContent = shortStatus(e.status);
      pill.style.fontSize = "12px";
      pill.style.fontWeight = "600";
      pill.style.padding = "4px 10px";
      pill.style.borderRadius = "999px";
      pill.style.backgroundColor = badgeColor(e.status);
      pill.style.color =
        e.status === "active"
          ? "#166534"
          : e.status === "closed"
          ? "#b91c1c"
          : "#4b5563";

      header.appendChild(left);
      header.appendChild(pill);
      card.appendChild(header);

      const info = document.createElement("p");
      info.style.margin = "2px 0 6px";
      info.style.fontSize = "13px";
      info.textContent = "প্রতি নির্বাচনে আপনি শুধুমাত্র একবার ভোট দিতে পারবেন।";
      card.appendChild(info);

      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.gap = "8px";
      btnRow.style.marginTop = "4px";

      const alreadyVoted = votedSet.has(e.id);

      const voteBtn = document.createElement("a");
      voteBtn.className = "btn btn-primary";
      voteBtn.style.flex = "1";
      voteBtn.style.textAlign = "center";
      voteBtn.textContent = alreadyVoted ? "ইতিমধ্যে ভোট দিয়েছেন" : "ভোট দিন";
      voteBtn.href = alreadyVoted ? "#" : `vote.html?election_id=${encodeURIComponent(e.id)}`;
      if (alreadyVoted) {
        voteBtn.style.opacity = "0.7";
        voteBtn.style.pointerEvents = "none";
      }

      const resultBtn = document.createElement("a");
      resultBtn.className = "btn btn-secondary";
      resultBtn.style.flex = "1";
      resultBtn.style.textAlign = "center";
      resultBtn.textContent = "ফলাফল দেখুন";
      resultBtn.href = `voter-result.html?election_id=${encodeURIComponent(e.id)}`;

      btnRow.appendChild(voteBtn);
      btnRow.appendChild(resultBtn);
      card.appendChild(btnRow);

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    statusEl.textContent = "ড্যাশবোর্ড ডেটা লোড করতে সমস্যা হয়েছে।";
  }
}

/**
 * Logs out the voter and redirects to login page.
 * @returns {void}
 */
function logout() {
  localStorage.removeItem(CC_CURRENT_USER_KEY);
  window.location.href = "/login/login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  loadVoterDashboard();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
});
