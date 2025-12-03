<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

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
   * @typedef {Object} CandidateUser
   * @property {string} [name] - Name of the user
   */

  /**
   * @typedef {Object} CandidateElection
   * @property {string} [title] - Title of the election
   */

  /**
   * @typedef {Object} Candidate
   * @property {string} id - Candidate ID
   * @property {boolean} is_approved - Whether candidate is approved
   * @property {string} election_id - Associated election ID
   * @property {CandidateUser} user - Candidate's user information
   * @property {CandidateElection} election - Candidate's election information
   */

  /**
   * Loads approved candidates from Supabase and renders them in the page
   * @async
   * @returns {Promise<void>}
   */
  async function loadApprovedCandidates() {
    /** @type {HTMLElement} */
    const approvedCandidatesList = document.getElementById("approvedCandidatesList");

    /** @type {{data: Candidate[] | null, error: import('@supabase/supabase-js').PostgrestError | null}} */
    const { data: candidatesData, error: candidatesError } = await supabaseClient
      .from("candidates")
      .select(`
        id,
        is_approved,
        election_id,
        user:users ( name ),
        election:elections ( title )
      `)
      .eq("is_approved", true);

    if (candidatesError) {
      console.error("Approved candidates error:", candidatesError);
      approvedCandidatesList.innerHTML = "<li>প্রার্থী তালিকা লোড করা যাচ্ছে না।</li>";
      return;
    }

    if (!candidatesData || candidatesData.length === 0) {
      approvedCandidatesList.innerHTML = "<li>এখনো কোনো প্রার্থী অনুমোদিত হয়নি।</li>";
      return;
    }

    approvedCandidatesList.innerHTML = candidatesData
      .map(candidate => {
        const candidateName = candidate.user?.name || "নাম নেই";
        const electionTitle = candidate.election?.title || "নির্বাচন নির্ধারিত নয়";

        return `
          <li style="margin-bottom:6px;">
            ${candidateName} - <small>${electionTitle}</small>
          </li>
        `;
      })
      .join("");
  }

  // Load approved candidates on page load
  loadApprovedCandidates();

