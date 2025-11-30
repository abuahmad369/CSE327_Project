


 /**
 * @file Handles user login for CampusCast.
 * @module login
 */

 
 /**
   * Login script for the CampusCast.
   *
   * Responsibilities:
   * - Setup Supabase client
   * - Authenticate user by email, password and role
   * - Store current user in localStorage
   * - Redirect user to proper dashboard based on role
   */

  /** @type {string} Supabase project URL. */
  const SUPABASE_URL = "https://hgxjuxgxgbjjqxxvafhx.supabase.co";

  /** @type {string} Supabase anonymous public key. */
  const SUPABASE_ANON_KEY = "sb_publishable_RqoNSHsQQOhs8dfL0OXsdA_TfeVyZcn";

  /**
   * Supabase client instance used for all database operations in this page.
   *
   * @type {import("@supabase/supabase-js").SupabaseClient}
   */
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /**
   * Local storage key for the current user information.
   *
   * Other pages in CampusCast can read this key to know
   * who is logged in and what their role is.
   *
   * @type {string}
   */
  const CC_CURRENT_USER_KEY = "cc_currentUser";

  /**
   * Mapping of user roles to redirect routes after successful login.
   *
   * @type {{ [role: string]: string }}
   */
  const ROLE_ROUTES = {
    supervisor: "/SAL/supervisor.html",
    candidate: "/IAH/candidates.html",
    voter: "/dashboard-test.html",
    public: "/publicDash.html"
  };

  /**
   * Create a SHA 256 hash from a plain text string.
   *
   * Used to hash passwords in the browser before comparing them
   * to the stored `password_hash` in the database.
   *
   * @async
   * @param {string} text Plain text to hash.
   * @returns {Promise<string>} Promise that resolves to a hex encoded SHA 256 hash.
   */
  async function hash(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Authenticate a user against the Supabase `users` table.
   *
   * The query checks:
   * - email
   * - role
   * - password_hash
   *
   * If a matching user is found, a minimal user object is returned and
   * the session is stored in localStorage.
   *
   * @async
   * @param {string} email Email address the user entered.
   * @param {string} password Plain text password the user entered.
   * @param {"supervisor" | "candidate" | "voter" | "public"} role Role selected in the login form.
   * @returns {Promise<{ id: string, name: string, email: string, role: string }>} The authenticated user object.
   * @throws {Error} If any required field is missing or credentials are invalid.
   */
  async function loginUser(email, password, role) {
    if (!email || !password || !role) {
      throw new Error("ইমেইল, পাসওয়ার্ড এবং রোল দিন।");
    }

    const password_hash = await hash(password);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("email", email)
      .eq("role", role)
      .eq("password_hash", password_hash)
      .single();

    if (error || !user) {
      throw new Error("ইমেইল, পাসওয়ার্ড বা রোল সঠিক নয়।");
    }

    // Persist minimal user info for later pages
    localStorage.setItem(
      CC_CURRENT_USER_KEY,
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      })
    );

    return user;
  }

  /**
   * Initialize login form behavior.
   *
   * Tasks:
   * - Find login form and status element
   * - Listen for submit events
   * - Validate inputs
   * - Call `loginUser` and handle success and errors
   *
   * This function is wrapped in an IIFE so that it runs automatically
   * when the script is loaded.
   *
   * @returns {void}
   */
  (function initLogin() {
    /** @type {HTMLFormElement | null} */
    const form = document.getElementById("loginForm");
    /** @type {HTMLElement | null} */
    const statusEl = document.getElementById("loginStatus");

    if (!form || !statusEl) {
      // If form or status element is missing, do nothing on this page
      return;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      statusEl.textContent = "";
      statusEl.style.color = "crimson";

      const email = /** @type {HTMLInputElement} */ (
        document.getElementById("email")
      ).value
        .trim()
        .toLowerCase();

      const password = /** @type {HTMLInputElement} */ (
        document.getElementById("password")
      ).value.trim();

      const role = /** @type {HTMLSelectElement} */ (
        document.getElementById("role")
      ).value;

      if (!role) {
        statusEl.textContent = "রোল নির্বাচন করুন।";
        return;
      }

      try {
        const user = await loginUser(email, password, role);

        // Decide where to send the user after login
        const route = ROLE_ROUTES[user.role] || "/";
        window.location.href = route;
      } catch (err) {
        statusEl.textContent =
          err instanceof Error ? err.message : "লগইন ব্যর্থ হয়েছে।";
      }
    });
  })();

