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
 * Loads all voters from Supabase and populates the HTML table.
 * @async
 */
async function loadVotersData() {
  const { data: votersData, error: votersError } = await supabaseClient.from('voters').select('*');
  const tbody = document.querySelector("#votersTable tbody");
  tbody.innerHTML = "";

  if (votersError) {
    tbody.innerHTML = `<tr><td colspan="4">Error fetching voters</td></tr>`;
    console.error(votersError);
    return;
  }

  votersData.forEach(voter => {
    const rowHtml = `<tr>
      <td>${voter.id}</td>
      <td>${voter.name}</td>
      <td>${voter.email}</td>
      <td>${voter.department}</td>
    </tr>`;
    tbody.innerHTML += rowHtml;
  });
}

/**
 * Logs out the supervisor and redirects to the home page.
 */
function logoutSupervisor() {
  alert("Logging out Supervisor...");
  window.location.href = "../index.html";
}

// Initialize the page
loadVotersData();
