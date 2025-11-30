<script>
// Global language key
const CC_LANG_KEY = "cc_lang";

// সব পেজ মিলিয়ে এখানেই key গুলো থাকবে
// চাইলে পরে আলাদা ফাইলে ভাগ করো
const CC_TRANSLATIONS = {
  bn: {
    // NAV + COMMON
    "nav.subtitle": "বিশ্ববিদ্যালয় ই ভোটিং সিস্টেম",
    "nav.admin": "প্রশাসক",
    "nav.candidate": "প্রার্থী",
    "nav.voter": "ভোটার",
    "nav.public": "পাবলিক",
    "nav.loginBtn": "লগইন",

    // LOGIN PAGE
    "login.badge": "নিরাপদ লগইন",
    "login.title": "আপনার অ্যাকাউন্টে প্রবেশ করুন",
    "login.subtitle": "নিবন্ধন করা ইমেইল ও পাসওয়ার্ড ব্যবহার করে লগইন করুন। নতুন হলে আগে নিবন্ধন করুন।",
    "login.registerBtn": "নিবন্ধন করুন",
    "login.note": "এন্ড টু এন্ড এনক্রিপশন সক্রিয়",
    "login.cardTitle": "লগইন",
    "login.emailLabel": "ইমেইল",
    "login.passwordLabel": "পাসওয়ার্ড",
    "login.roleLabel": "লগইন হিসেবে",
    "login.rolePlaceholder": "রোল নির্বাচন করুন",
    "login.roleSupervisor": "প্রশাসক",
    "login.roleCandidate": "প্রার্থী",
    "login.roleVoter": "ভোটার",
    "login.rolePublic": "পাবলিক",
    "login.submit": "লগইন",
    "login.noAccount": "অ্যাকাউন্ট নেই? নিবন্ধন করুন",
    "login.forgot": "পাসওয়ার্ড ভুলে গেছেন?",

    // উদাহরণ REG PAGE
    "reg.title": "নতুন অ্যাকাউন্ট তৈরি করুন",
    "reg.submit": "নিবন্ধন সম্পন্ন করুন",

    // FOOTER
    "footer.transparencyTitle": "স্বচ্ছ প্রক্রিয়া",
    "footer.transparencyText": "সমস্ত রেকর্ড যাচাইযোগ্য ও নিরীক্ষাযোগ্য।",
    "footer.securityTitle": "এন্ড টু এন্ড এনক্রিপশন",
    "footer.securityText": "প্রতিটি ধাপে আপনার তথ্য সুরক্ষিত থাকে।",
    "footer.speedTitle": "দ্রুত ও কার্যকর",
    "footer.speedText": "রিয়েল টাইমে ফলাফল দেখতে পারবেন।"
  },
  en: {
    // NAV + COMMON
    "nav.subtitle": "University e voting system",
    "nav.admin": "Admin",
    "nav.candidate": "Candidate",
    "nav.voter": "Voter",
    "nav.public": "Public",
    "nav.loginBtn": "Login",

    // LOGIN PAGE
    "login.badge": "Secure login",
    "login.title": "Sign in to your account",
    "login.subtitle": "Use your registered email and password to log in. If you are new, please register first.",
    "login.registerBtn": "Register",
    "login.note": "End to end encryption enabled",
    "login.cardTitle": "Login",
    "login.emailLabel": "Email",
    "login.passwordLabel": "Password",
    "login.roleLabel": "Login as",
    "login.rolePlaceholder": "Select role",
    "login.roleSupervisor": "Admin",
    "login.roleCandidate": "Candidate",
    "login.roleVoter": "Voter",
    "login.rolePublic": "Public",
    "login.submit": "Login",
    "login.noAccount": "No account? Register",
    "login.forgot": "Forgot password?",

    // REG PAGE example
    "reg.title": "Create a new account",
    "reg.submit": "Complete registration",

    // FOOTER
    "footer.transparencyTitle": "Transparent process",
    "footer.transparencyText": "All records are verifiable and auditable.",
    "footer.securityTitle": "End to end encryption",
    "footer.securityText": "Your data is protected at every step.",
    "footer.speedTitle": "Fast and efficient",
    "footer.speedText": "View results in real time."
  }
};

function ccApplyLanguage(lang) {
  const dict = CC_TRANSLATIONS[lang] || CC_TRANSLATIONS.bn;
  document.documentElement.setAttribute("lang", lang === "en" ? "en" : "bn");
  localStorage.setItem(CC_LANG_KEY, lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  const bnBtn = document.getElementById("langBn");
  const enBtn = document.getElementById("langEn");

  if (bnBtn && enBtn) {
    if (lang === "bn") {
      bnBtn.style.background = "rgba(255,255,255,0.2)";
      bnBtn.style.borderColor = "rgba(255,255,255,0.8)";
      enBtn.style.background = "transparent";
      enBtn.style.borderColor = "rgba(255,255,255,0.3)";
    {"}"} else {
      enBtn.style.background = "rgba(255,255,255,0.2)";
      enBtn.style.borderColor = "rgba(255,255,255,0.8)";
      bnBtn.style.background = "transparent";
      bnBtn.style.borderColor = "rgba(255,255,255,0.3)";
    }
  }
}

function ccInitLang() {
  const saved = localStorage.getItem(CC_LANG_KEY) || "bn";
  ccApplyLanguage(saved);

  const bnBtn = document.getElementById("langBn");
  const enBtn = document.getElementById("langEn");

  if (bnBtn) bnBtn.addEventListener("click", () => ccApplyLanguage("bn"));
  if (enBtn) enBtn.addEventListener("click", () => ccApplyLanguage("en"));
}
document.addEventListener("DOMContentLoaded", ccInitLang);
</script>
