/**
 * Supabase configuration.
 * @constant {string}
 */
const SUPABASE_URL = "https://hgxjuxgxgbjjqxxvafhx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RqoNSHsQQOhs8dfL0OXsdA_TfeVyZcn";

/** LocalStorage key for current user */
const CC_CURRENT_USER_KEY = "cc_currentUser";

/** Supabase client */
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * @typedef {Object} SupervisorUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {"supervisor"|"candidate"|"voter"|"public"} role
 */

/**
 * @typedef {Object} CandidateApplication
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} election_id
 * @property {string|null} requested_symbol
 * @property {string|null} manifesto
 * @property {boolean} is_approved
 * @property {"draft"|"submitted"|"under_review"|"approved"|"rejected"} status
 * @property {Object|null} user
 * @property {Object|null} election
 */

/** @type {CandidateApplication[]} */
let candidateApplications = [];

/** Read current user from localStorage */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CC_CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Ensure user is supervisor */
function ensureSupervisor() {
  const user = getCurrentUser();
  if (!user || user.role !== "supervisor") {
    alert("শুধুমাত্র সুপারভাইজার প্রবেশ করতে পারবেন।");
    window.location.href = "../login/login.html";
    return null;
  }
  document.getElementById("welcomeText").textContent = `স্বাগতম, ${user.name} (Supervisor)।`;
  return user;
}

/** Show error message */
function showError(message) {
  let box = document.getElementById("dashboardError");
  if (!box) {
    box = document.createElement("p");
    box.id = "dashboardError";
    box.style.color = "crimson";
    box.style.marginTop = "8px";
    box.style.fontSize = "14px";
    document.querySelector(".content")?.appendChild(box);
  }
  box.textContent = message;
}

/** Load top metrics */
async function loadMetrics(user) {
  const { data: elections, error: electionsError } = await supabase.from("elections").select("id,status");
  if (electionsError) showError("Elections error: " + electionsError.message);

  document.getElementById("totalElections").textContent = elections?.length || 0;
  document.getElementById("activeElections").textContent = elections?.filter(e => e.status?.toLowerCase() === "active").length || 0;

  const { data: candidates, error: candidatesError } = await supabase.from("candidates").select("id");
  if (candidatesError) showError("Candidates error: " + candidatesError.message);
  document.getElementById("registeredCandidates").textContent = candidates?.length || 0;

  const { data: voters, error: votersError } = await supabase.from("voters").select("id");
  if (votersError) showError("Voters error: " + votersError.message);
  document.getElementById("registeredVoters").textContent = voters?.length || 0;

  const { data: polls, error: pollsError } = await supabase.from("polls").select("id").eq("supervisor_id", user.id);
  if (pollsError) showError("Polls error: " + pollsError.message);
  document.getElementById("supervisedPolls").textContent = polls?.length || 0;
}

/** Fetch candidate applications */
async function fetchCandidateApplications() {
  const { data, error } = await supabase.from("candidates").select(`
    id,user_id,election_id,requested_symbol,manifesto,is_approved,status,
    user:user_id(name,email,dept),
    election:election_id(title,status)
  `).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

/** Map status to Bangla text */
function statusText(status) {
  return {
    submitted: "সাবমিট করা হয়েছে",
    under_review: "পর্যালোচনাধীন",
    approved: "অনুমোদিত",
    rejected: "বাতিল"
  }[status] || "ড্রাফট";
}

/** Status colors */
function statusColors(status) {
  return {
    submitted: { bg: "#fef3c7", color: "#92400e" },
    under_review: { bg: "#fef3c7", color: "#92400e" },
    approved: { bg: "#dcfce7", color: "#166534" },
    rejected: { bg: "#fee2e2", color: "#b91c1c" },
    draft: { bg: "#e5e7eb", color: "#4b5563" }
  }[status] || { bg: "#e5e7eb", color: "#4b5563" };
}

/** Render candidate applications */
function renderApplications() {
  const container = document.getElementById("applicationsContainer");
  const emptyText = document.getElementById("applicationsEmpty");
  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("searchInput");
  if (!container || !statusFilter || !searchInput) return;

  container.innerHTML = "";
  if (!candidateApplications.length) {
    emptyText.textContent = "এখনো কোনো প্রার্থীর আবেদন পাওয়া যায়নি।";
    return;
  }

  const filterStatus = statusFilter.value;
  const search = searchInput.value.trim().toLowerCase();

  const filtered = candidateApplications.filter(app => {
    if (filterStatus === "pending" && !["submitted","under_review"].includes(app.status)) return false;
    else if (filterStatus !== "all" && filterStatus !== "pending" && app.status !== filterStatus) return false;

    const name = app.user?.name?.toLowerCase() || "";
    const email = app.user?.email?.toLowerCase() || "";
    if (search && !name.includes(search) && !email.includes(search)) return false;

    return true;
  });

  if (!filtered.length) {
    const p = document.createElement("p");
    p.textContent = "এই ফিল্টার অনুযায়ী কোনো আবেদন পাওয়া যায়নি।";
    p.style.fontSize = "14px";
    p.style.color = "#4b5563";
    container.appendChild(p);
    return;
  }

  filtered.forEach(app => {
    const card = document.createElement("div");
    card.className = "application-card";
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <div>
          <p style="margin:0 0 2px; font-weight:700;">${app.user?.name||"Unknown"}</p>
          <p style="margin:0; font-size:13px; color:#4b5563;">
            ${app.user?.email||"no-email"}${app.user?.dept?` · ${app.user.dept}`:""}
          </p>
        </div>
        <span style="font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;background-color:${statusColors(app.status).bg};color:${statusColors(app.status).color}">
          ${statusText(app.status)}
        </span>
      </div>
      <p style="margin:4px 0;font-size:13px;"><strong>নির্বাচন:</strong> ${app.election?.title||"কোনো নির্বাচন নির্বাচন করা হয়নি"}</p>
      <p style="margin:0 0 4px;font-size:13px;"><strong>প্রতীক (requested):</strong> ${app.requested_symbol||"নির্ধারিত নয়"}</p>
      ${app.manifesto?`<p style="margin:0 0 6px;font-size:13px;"><strong>ইশতেহার:</strong> ${app.manifesto}</p>`:""}
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px;">
        <button class="approve-btn" ${["approved","rejected"].includes(app.status)?"disabled":""}>Approve</button>
        <button class="reject-btn" ${["approved","rejected"].includes(app.status)?"disabled":""}>Reject</button>
      </div>
    `;
    const approveBtn = card.querySelector(".approve-btn");
    const rejectBtn = card.querySelector(".reject-btn");
    approveBtn?.addEventListener("click", ()=>handleStatusChange(app.id,"approved"));
    rejectBtn?.addEventListener("click", ()=>handleStatusChange(app.id,"rejected"));
    container.appendChild(card);
  });
}

/** Update candidate status */
async function handleStatusChange(candidateId, newStatus) {
  if (!window.confirm(`আপনি কি সত্যি এই প্রার্থীকে ${newStatus} করতে চান?`)) return;
  const approved = newStatus === "approved";
  const payload = { status: newStatus, is_approved: approved, approved_at: new Date().toISOString() };

  const { error } = await supabase.from("candidates").update(payload).eq("id", candidateId);
  if (error) return alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে: " + error.message);

  candidateApplications = candidateApplications.map(app => app.id===candidateId?{...app,...payload}:app);
  renderApplications();
}

/** Logout */
function logout() {
  localStorage.removeItem(CC_CURRENT_USER_KEY);
  window.location.href = "../index.html";
}

document.getElementById("logoutBtn")?.addEventListener("click", logout);

/** Initialize dashboard */
async function initSupervisorDashboard() {
  const user = ensureSupervisor();
  if (!user) return;
  await loadMetrics(user);
  document.getElementById("statusFilter")?.addEventListener("change", renderApplications);
  document.getElementById("searchInput")?.addEventListener("input", renderApplications);

  try {
    candidateApplications = await fetchCandidateApplications();
  } catch(err) {
    showError(err.message||"প্রার্থীর আবেদন লোড করতে ব্যর্থ হয়েছে।");
    candidateApplications = [];
  }

  renderApplications();
}

initSupervisorDashboard();
