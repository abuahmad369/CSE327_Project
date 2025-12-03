/**
 * Supabase project URL.
 * @constant {string}
 */
const supabaseUrl = "https://yhhypbrmwlkelikrxbvs.supabase.co";

/**
 * Supabase public anon key.
 * @constant {string}
 */
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloaHlwYnJtd2xrZWxpa3J4YnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDY1MDMsImV4cCI6MjA3OTQ4MjUwM30.PMNqc_nqU2D5MJDSGrxwgITAmqEg7X3OozshJq5hnkA";

/**
 * Supabase client instance.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

/**
 * Loads all polls from Supabase and populates the polls container.
 * @async
 */
async function loadPollData() {
  const { data: pollsData, error: pollsError } = await supabaseClient.from('polls').select('*');
  const pollContainer = document.getElementById("pollContainer");
  pollContainer.innerHTML = "";

  if (pollsError) {
    pollContainer.innerHTML = "<p>Error loading polls</p>";
    console.error(pollsError);
    return;
  }

  pollsData.forEach(poll => {
    const pollCard = document.createElement("div");
    pollCard.className = "poll-card";

    pollCard.innerHTML = `
      <div class="poll-header">
        <h3>${poll.title}</h3>
        <span class="status ${poll.status.toLowerCase()}">${poll.status}</span>
      </div>
      <div class="poll-details">
        <p><strong>Total Candidates:</strong> ${poll.total_candidates}</p>
        <p><strong>Total Voters:</strong> ${poll.total_voters}</p>
        <p><strong>Start Date:</strong> ${poll.start_date}</p>
        <p><strong>End Date:</strong> ${poll.end_date}</p>
      </div>
      <div class="poll-actions">
        <button class="view-btn">View Details</button>
        ${poll.status === "Ongoing" ? '<button class="stop-btn">Stop Poll</button>' : ''}
        ${poll.status === "Upcoming" ? '<button class="start-btn">Start Poll</button><button class="delete-btn">Delete</button>' : ''}
        ${poll.status === "Completed" ? '<button class="delete-btn">Remove</button>' : ''}
      </div>
    `;

    pollContainer.appendChild(pollCard);
  });
}

/**
 * Logs out the supervisor and redirects to the home page.
 */
function logoutSupervisor() {
  alert("Logging out Supervisor...");
  window.location.href = "../index.html";
}

// Initialize the page by loading polls
loadPollData();
