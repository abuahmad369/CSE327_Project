
  /**
 * @file Handles user registration for CampusCast.
 * @module registration
 */

  
  
  /**
   * Registration script for the CampusCast.
   *
   * Handles:
   * - Supabase client setup
   * - User registration
   * - Local session storage
   * - Redirecting user based on role
   */

  /** @type {string} Supabase project URL. */
  const SUPABASE_URL = "https://hgxjuxgxgbjjqxxvafhx.supabase.co";

  /** @type {string} Supabase anonymous public key. */
  const SUPABASE_ANON_KEY = "sb_publishable_RqoNSHsQQOhs8dfL0OXsdA_TfeVyZcn";

  /** @type {import("@supabase/supabase-js").SupabaseClient} Supabase client instance. */
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /**
   * Local storage key that keeps info about the currently logged in user.
   * @type {string}
   */
  const CC_CURRENT_USER_KEY = "cc_currentUser";

  /**
   * Map of application roles to their redirect routes after successful registration.
   *
   * @type {{ [role: string]: string }}
   */
  const ROLE_ROUTES = {
    candidate: "/done.html",
    voter: "/done.html",
    public: "/done.html"
  };

  /**
   * Create a SHA 256 hash from a given text value.
   *
   * Used for hashing user passwords before storing them in the database.
   *
   * @async
   * @param {string} text Plain text value to hash.
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
   * Register a new user in the Supabase "users" table.
   *
   * Validates input, hashes the password, inserts the row, and returns the created user.
   *
   * @async
   * @param {Object} params Registration data.
   * @param {string} params.email User email address.
   * @param {string} params.password Plain text password that will be hashed.
   * @param {string} params.name Full name of the user.
   * @param {string} params.dob Date of birth as an ISO date string.
   * @param {"candidate" | "voter" | "public"} params.role Role that the user selected.
   * @returns {Promise<Object>} Promise that resolves to the created user row from Supabase.
   * @throws {Error} If validation fails or Supabase returns an error.
   */
  async function registerUser({ email, password, name, dob, role }) {
    if (!email || !password || !name || !dob || !role) {
      throw new Error("সব ঘর পূরণ করুন এবং রোল নির্বাচন করুন।");
    }

    const password_hash = await hash(password);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password_hash,
          role,
          dob
        }
      ])
      .select()
      .single();

    if (error) {
      // 23505 is the duplicate key error from Postgres
      if (error.code === "23505") {
        throw new Error("এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।");
      }
      throw new Error(error.message || "নিবন্ধন ব্যর্থ হয়েছে।");
    }

    return data;
  }

  /**
   * Store the current user info in localStorage so that other pages
   * can read it and know who is logged in.
   *
   * Only keeps a small subset of fields for convenience.
   *
   * @param {Object} user User object returned from Supabase.
   * @param {string} user.id Unique user identifier.
   * @param {string} user.email User email address.
   * @param {string} user.role User role ("candidate", "voter" or "public").
   * @param {string} user.name Full name of the user.
   * @returns {void}
   */
  function setCurrentUserSession(user) {
    localStorage.setItem(
      CC_CURRENT_USER_KEY,
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      })
    );
  }

  /**
   * Initialize the registration form logic.
   *
   * Responsibilities:
   * - Attach submit listener to the registration form
   * - Validate required fields on the client side
   * - Call registerUser to create a new user in Supabase
   * - Save the session locally and redirect based on user role
   *
   * @returns {void}
   */
  (function initRegistration() {
    /** @type {HTMLFormElement | null} */
    const form = document.getElementById("registrationForm");
    /** @type {HTMLElement | null} */
    const statusEl = document.getElementById("regStatus");

    if (!form || !statusEl) {
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusEl.textContent = "";
      statusEl.style.color = "crimson";

      const name = /** @type {HTMLInputElement} */ (
        document.getElementById("name")
      ).value.trim();

      const dob = /** @type {HTMLInputElement} */ (
        document.getElementById("dob")
      ).value;

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

      if (!name || !dob || !email || !password || !role) {
        statusEl.textContent = "সব ঘর পূরণ করুন এবং রোল নির্বাচন করুন।";
        return;
      }

      try {
        const user = await registerUser({ email, password, name, dob, role });

        // SQL trigger will also create a row in the role specific table
        // such as candidates, voters or public_users
        setCurrentUserSession(user);

        statusEl.style.color = "green";
        statusEl.textContent =
          "নিবন্ধন সফল হয়েছে, আপনাকে প্যানেলে পাঠানো হচ্ছে।";

        const route = ROLE_ROUTES[role] || "/login/login.html";
        window.location.href = route;
      } catch (err) {
        statusEl.textContent =
          err instanceof Error
            ? err.message
            : "নিবন্ধন ব্যর্থ হয়েছে।";
      }
    });
  })();
