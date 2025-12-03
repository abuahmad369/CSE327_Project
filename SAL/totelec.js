/**
 * @fileoverview Total Elections page JS
 * Fetches elections from Supabase and handles filtering and logout.
 */

/** @type {string} Supabase URL */
const SUPABASE_URL = "https://yhhypbrmwlkelikrxbvs.supabase.co";

/** @type {string} Supabase Anon Key */
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloaHlwYnJtd2xrZWxpa3J4YnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDY1MDMsImV4cCI6MjA3OTQ4MjUwM30.PMNqc_nqU2D5MJDSGrxwgITAmqEg7X3OozshJq5hnkA";

/** @type {import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2').SupabaseClient} */
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** @type {Array<Object>} All elections fetched from Supabase */
let allElections = [];

/**
 * Fetch elections from Supabase
 * @returns {Promise<void>}
 */
async function loadElections() {
  const { data, error } = await supabaseClient.from('elections').select('*');
  if (error) {
    console.error("Error fetching elections:", error);
    document.getElementById("loadingText").textContent = "Failed to load elections.";
    return;
  }

  allElections = data || [];
  renderElections();
}

/**
 * Render elections based on filter
 * @returns {void}
 */
function renderElections() {
  const electionList = document.getElementById("electionList");
  const statusFilter = document.getElementById("statusFilter").value;

  electionList.innerHTML = "";

  if (!allElections.length) {
    electionList.innerHTML = '<p style="color:#ccc;">No elections found.</p>';
    return;
  }

  const filtered = allElections.filter(election => {
    return statusFilter === "all" || election.status.toLowerCase() === statusFilter;
  });

  if (!filtered.length) {
    electionList.innerHTML = '<p style="color:#ccc;">No elections match this filter.</p>';
    return;
  }

  filtered.forEach(election => {
    const card = document.createElement("div");
    card.className = "electionCard";

    card.innerHTML = `
      <h3>${election.title}</h3>
      <p><strong>Date:</strong> ${election.start_date || "Upcoming"}</p>
      <p><strong>Turnout:</strong> ${election.turnout || 0}%</p>
      <div class="progressBar"><div class="progress" style="width:${election.turnout || 0}%"></div></div>
      <span class="status ${election.status.toLowerCase()}">${election.status}</span>
      <button class="btnView">View Details</button>
    `;

    electionList.appendChild(card);
  });
}

/**
 * Logout supervisor
 * @returns {void}
 */
function logoutSupervisor() {
  alert("Logging out Supervisor...");
  window.location.href = "../index.html";
}

/**
 * Initialize page: set events and load elections
 */
function init() {
  document.getElementById("logoutBtn").addEventListener("click", logoutSupervisor);
  document.getElementById("statusFilter").addEventListener("change", renderElections);

  loadElections();
}

// Run initialization
init();
