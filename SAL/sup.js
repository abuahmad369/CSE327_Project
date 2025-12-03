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
 * Loads dashboard data for the supervisor panel.
 * Fetches total elections, active elections, registered voters, and supervised polls.
 * Populates respective elements in the dashboard.
 * @async
 */
async function loadDashboardData() {
  // Total Elections
  const { data: elections, error: electionsError } = await supabaseClient.from('elections').select('*');
  if (electionsError) console.error(electionsError);
  document.getElementById('totalElections').innerText = elections ? elections.length : 0;

  // Active Elections
  const activeElections = elections ? elections.filter(e => e.status.toLowerCase() === 'active') : [];
  document.getElementById('activeElections').innerText = activeElections.length;

  // Registered Voters
  const { data: voters, error: votersError } = await supabaseClient.from('voters').select('*');
  if (votersError) console.error(votersError);
  document.getElementById('registeredVoters').innerText = voters ? voters.length : 0;

  // Supervised Polls
  const { data: polls, error: pollsError } = await supabaseClient.from('polls').select('*');
  if (pollsError) console.error(pollsError);
  document.getElementById('supervisedPolls').innerText = polls ? polls.length : 0;
}

/**
 * Logs out the supervisor and redirects to the homepage.
 */
function logoutSupervisor() {
  alert("Logging out Supervisor...");
  window.location.href = "../index.html";
}

/**
 * Test Supabase connection by fetching elections, voters, and polls tables.
 * Outputs data or errors to console.
 * @async
 */
async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");

  const { data: elections, error: electionsError } = await supabaseClient.from('elections').select('*');
  if (electionsError) console.error("Elections Error:", electionsError);
  else console.log("Elections table:", elections);

  const { data: voters, error: votersError } = await supabaseClient.from('voters').select('*');
  if (votersError) console.error("Voters Error:", votersError);
  else console.log("Voters table:", voters);

  const { data: polls, error: pollsError } = await supabaseClient.from('polls').select('*');
  if (pollsError) console.error("Polls Error:", pollsError);
  else console.log("Polls table:", polls);

  alert("Check the console for Supabase data output!");
}

// Initialize dashboard on page load
loadDashboardData();
testSupabaseConnection();
