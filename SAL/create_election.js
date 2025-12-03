/**
 * Supabase credentials
 * @constant {string}
 */
const SUPABASE_URL = "https://hgxjuxgxgbjjqxxvafhx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RqoNSHsQQOhs8dfL0OXsdA_TfeVyZcn";

/**
 * Supabase client instance
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * LocalStorage key for current user
 * @constant {string}
 */
const CURRENT_USER_KEY = "cc_currentUser";

/**
 * @typedef {Object} User
 * @property {string} id - Unique ID of the user
 * @property {string} role - Role of the user (e.g., "supervisor")
 * @property {string} [name] - Optional user name
 */

/**
 * Retrieves the current logged-in user from localStorage
 * @returns {User|null} The user object if logged in, otherwise null
 */
function getCurrentUser() {
  try {
    const rawUserData = localStorage.getItem(CURRENT_USER_KEY);
    if (!rawUserData) return null;
    return JSON.parse(rawUserData);
  } catch {
    return null;
  }
}

/**
 * Logs out the current user and redirects to the home page
 */
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "../index.html";
}

/**
 * HTML form element for creating elections
 * @type {HTMLFormElement}
 */
const createElectionForm = document.getElementById("createElectionForm");

/**
 * HTML element to display status messages
 * @type {HTMLElement}
 */
const statusElement = document.getElementById("status");

/**
 * @typedef {Object} Election
 * @property {string} title - Title of the election
 * @property {string} description - Description of the election
 * @property {string|null} start_at - Start date/time (optional)
 * @property {string|null} end_at - End date/time (optional)
 * @property {string} status - Election status ("scheduled")
 * @property {string} created_by - Supervisor ID who created it
 */

/**
 * Handles the form submission to create a new election.
 * Validates user role and form fields before inserting into Supabase.
 * @param {SubmitEvent} event - The form submit event
 */
createElectionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  statusElement.style.color = "crimson";
  statusElement.textContent = "তথ্য যাচাই করা হচ্ছে...";

  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "supervisor") {
    statusElement.textContent = "শুধুমাত্র Supervisor এই কাজটি করতে পারবেন।";
    return;
  }

  const titleValue = document.getElementById("title").value.trim();
  const descriptionValue = document.getElementById("description").value.trim();
  const startAtValue = document.getElementById("start_at").value || null;
  const endAtValue = document.getElementById("end_at").value || null;

  if (!titleValue) {
    statusElement.textContent = "শিরোনাম লিখতে হবে।";
    return;
  }

  /** @type {{ error: import('@supabase/supabase-js').PostgrestError|null }} */
  const { error } = await supabaseClient
    .from("elections")
    .insert([
      {
        title: titleValue,
        description: descriptionValue,
        start_at: startAtValue,
        end_at: endAtValue,
        status: "scheduled",
        created_by: currentUser.id
      }
    ]);

  if (error) {
    console.error("Create election error:", error);
    statusElement.style.color = "crimson";
    statusElement.textContent = "নির্বাচন তৈরি ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
    return;
  }

  statusElement.style.color = "green";
  statusElement.textContent = "নির্বাচন সফলভাবে তৈরি হয়েছে।";
  createElectionForm.reset();
});
