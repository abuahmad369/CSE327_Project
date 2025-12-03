/**
 * Render elections list applying search and status filter
 * @returns {void}
 */
function renderElections() {
  const list = document.getElementById("electionList");
  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const filterStatus = document.getElementById("statusFilter")?.value || "all";

  list.innerHTML = "";
  const emptyMessageEl = document.getElementById("electionsEmpty");
  if (emptyMessageEl) emptyMessageEl.textContent = "";

  if (!elections.length) {
    if (emptyMessageEl) emptyMessageEl.textContent = "কোনো নির্বাচন পাওয়া যায়নি।";
    return;
  }

  // Filter elections based on search and status
  const filtered = elections.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search);
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!filtered.length) {
    if (emptyMessageEl) emptyMessageEl.textContent = "কোনো নির্বাচন পাওয়া যায়নি।";
    return;
  }

  // Render each election card
  filtered.forEach(election => {
    const statusClass = statusColors(election.status).class;
    const turnout = election.turnout ?? 0;
    const card = document.createElement("div");
    card.className = "electionCard";
    card.innerHTML = `
      <h3>${election.title}</h3>
      <p><strong>Date:</strong> ${election.date ?? "আগামী"}</p>
      <p><strong>Turnout:</strong> ${turnout}%</p>
      <div class="progressBar"><div class="progress" style="width:${turnout}%"></div></div>
      <span class="status ${statusClass}">${election.status}</span>
      <button class="btnView">View Details</button>
    `;
    list.appendChild(card);
  });
}

/**
 * Handle search input change
 */
function onSearchInput() {
  renderElections();
}

/**
 * Handle status filter change
 */
function onStatusFilterChange() {
  renderElections();
}

/**
 * Initialize the supervisor elections panel
 */
async function init() {
  ensureSupervisor();
  elections = await fetchElections();
  renderElections();

  // Attach event listeners
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", onSearchInput);

  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) statusFilter.addEventListener("change", onStatusFilterChange);
}

// Initialize panel on page load
init();
