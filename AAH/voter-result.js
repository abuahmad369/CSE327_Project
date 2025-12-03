/**
 * Supabase project URL.
 * @type {string}
 */
const SUPABASE_URL = "https://dfniyjbsmznnzklfprsx.supabase.co";

/**
 * Supabase public anon key.
 * @type {string}
 */
const SUPABASE_ANON_KEY = "sb_publishable_XNUFe9_ygaeMfYHd6Z97XQ_UE1-VhGn";

/**
 * Supabase client instance.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * LocalStorage key for the current user.
 * @type {string}
 */
const CC_CURRENT_USER_KEY = "cc_currentUser";

/**
 * Retrieves the currently logged in user from localStorage.
 * Parses JSON safely.
 * @returns {object|null} Returns the user object or null if missing/invalid.
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
 * Ensures the current user exists and has the voter role.
 * Redirects to login page if invalid.
 * @returns {object|null} Voter user object if valid, otherwise null.
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
 * Retrieves a query parameter value from the URL.
 * Example: getQueryParam("election_id")
 * @param {string} name Name of the query parameter.
 * @returns {string|null} Value or null if missing.
 */
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Loads election results, candidate list and vote counts.
 * Populates the page with formatted results and highlights the user's choice.
 * @async
 * @returns {Promise<void>}
 */
async function loadResults() {
  const user = requireVoter();
  if (!user) return;

  const electionId = getQueryParam("election_id");
  const titleEl = document.getElementById("resultTitle");
  const descEl = document.getElementById("resultDescription");
  const statusEl = document.getElementById("resultStatus");
  const container = document.getElementById("resultsContainer");

  if (!electionId || !titleEl || !descEl || !statusEl || !container) {
    if (statusEl) statusEl.textContent = "নির্বাচনের তথ্য পাওয়া যায়নি।";
    return;
  }

  statusEl.textContent = "ফলাফল লোড হচ্ছে...";
  container.innerHTML = "";

  try {
    const { data: election, error: eErr } = await supabase
      .from("elections")
      .select("*")
      .eq("id", electionId)
      .single();

    if (eErr || !election) {
      statusEl.textContent = "এই আইডি অনুযায়ী কোনো নির্বাচন পাওয়া যায়নি।";
      return;
    }

    titleEl.textContent = election.title || "নির্বাচনের ফলাফল";

    const start = election.start_at
      ? new Date(election.start_at).toLocaleString()
      : "শুরু নির্ধারিত নয়";

    const end = election.end_at
      ? new Date(election.end_at).toLocaleString()
      : "শেষ নির্ধারিত নয়";

    descEl.textContent = `এই নির্বাচনের ফলাফল দেখানো হচ্ছে। সময়: ${start} থেকে ${end}`;

    const { data: candidates, error: cErr } = await supabase
      .from("candidates")
      .select(
        "id, election_id, approved_symbol, requested_symbol, symbol, user:users(name, email, dept)"
      )
      .eq("election_id", electionId);

    if (cErr) throw cErr;

    const { data: votes, error: vErr } = await supabase
      .from("votes")
      .select("*")
      .eq("election_id", electionId);

    if (vErr) throw vErr;

    const totalVotes = (votes || []).length;

    /**
     * Count votes per candidate
     * @type {Record<string, number>}
     */
    const counts = {};
    (votes || []).forEach(v => {
      counts[v.candidate_id] = (counts[v.candidate_id] || 0) + 1;
    });

    /** Which candidate did this voter choose? */
    let myCandidateId = null;
    (votes || []).forEach(v => {
      if (v.voter_id === user.id) {
        myCandidateId = v.candidate_id;
      }
    });

    if (!candidates || !candidates.length) {
      statusEl.textContent = "এই নির্বাচনের জন্য কোনো প্রার্থী পাওয়া যায়নি।";
      return;
    }

    if (!totalVotes) {
      statusEl.textContent = "এখনো কোনো ভোট কাস্ট হয়নি।";
    } else {
      statusEl.textContent = `মোট ${totalVotes} টি ভোট কাস্ট হয়েছে।`;
    }

    candidates.sort(
      (a, b) => (counts[b.id] || 0) - (counts[a.id] || 0)
    );

    container.innerHTML = "";

    candidates.forEach(c => {
      const votesFor = counts[c.id] || 0;
      const share =
        totalVotes > 0
          ? Math.round((votesFor / totalVotes) * 1000) / 10
          : 0;

      const card = document.createElement("div");
      card.style.border = "1px solid var(--border)";
      card.style.borderRadius = "12px";
      card.style.padding = "10px 12px";
      card.style.backgroundColor = "#f9fafb";

      if (c.id === myCandidateId) {
        card.style.borderColor = "#22c55e";
        card.style.boxShadow = "0 0 0 1px #22c55e55";
      }

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "flex-start";
      header.style.marginBottom = "4px";

      const left = document.createElement("div");

      const nameP = document.createElement("p");
      nameP.style.margin = "0 0 2px";
      nameP.style.fontWeight = "700";
      nameP.textContent = c.user?.name || "অজানা প্রার্থী";

      const symbol =
        c.approved_symbol ||
        c.requested_symbol ||
        c.symbol ||
        "নির্ধারিত নয়";

      const subP = document.createElement("p");
      subP.style.margin = "0";
      subP.style.fontSize = "13px";
      subP.style.color = "#4b5563";
      subP.textContent = `প্রতীক: ${symbol}`;

      left.appendChild(nameP);
      left.appendChild(subP);
      header.appendChild(left);

      if (c.id === myCandidateId) {
        const tag = document.createElement("span");
        tag.textContent = "আপনার ভোট";
        tag.style.fontSize = "12px";
        tag.style.fontWeight = "600";
        tag.style.padding = "4px 10px";
        tag.style.borderRadius = "999px";
        tag.style.backgroundColor = "#dcfce7";
        tag.style.color = "#166534";
        header.appendChild(tag);
      }

      card.appendChild(header);

      const stats = document.createElement("p");
      stats.style.margin = "2px 0 6px";
      stats.style.fontSize = "13px";
      stats.innerHTML =
        `<strong>মোট ভোট:</strong> ${votesFor} (` +
        `${share.toFixed(1)}%)`;
      card.appendChild(stats);

      const barOuter = document.createElement("div");
      barOuter.style.width = "100%";
      barOuter.style.height = "8px";
      barOuter.style.borderRadius = "999px";
      barOuter.style.backgroundColor = "#e5e7eb";
      barOuter.style.overflow = "hidden";

      const barInner = document.createElement("div");
      barInner.style.height = "100%";
      barInner.style.width = share + "%";
      barInner.style.backgroundColor = "#16a34a";

      barOuter.appendChild(barInner);
      card.appendChild(barOuter);

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    statusEl.textContent = "ফলাফল লোড করতে সমস্যা হয়েছে।";
  }
}

document.addEventListener("DOMContentLoaded", loadResults);
