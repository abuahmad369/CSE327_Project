
// helper: check basic email pattern
function isValidEmail(email) {
  // very simple pattern
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// main function
function validateLoginInput(email, password, role) {
  const errors = {};

  // email checks
  if (!email || email.trim() === "") {
    errors.email = "ইমেইল দিন।";
  } else if (!isValidEmail(email.trim())) {
    errors.email = "সঠিক ইমেইল দিন।";
  }

  // password checks
  if (!password || password.trim() === "") {
    errors.password = "পাসওয়ার্ড দিন।";
  } else if (password.length < 6) {
    errors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  }

  // role checks
  const allowedRoles = ["supervisor", "candidate", "voter", "public"];

  if (!role || role.trim() === "") {
    errors.role = "রোল নির্বাচন করুন।";
  } else if (!allowedRoles.includes(role)) {
    errors.role = "ভুল রোল নির্বাচন করা হয়েছে।";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors: errors
  };
}


// if (typeof module !== "undefined") {
//   module.exports = { validateLoginInput };
// }
