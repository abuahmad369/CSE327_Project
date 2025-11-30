// Validation logic for the CampusCast registration form

// simple email pattern, enough for validation
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function validateRegistrationInput(name, dob, email, password, role) {
  const errors = {};

  // name check
  if (!name || name.trim() === "") {
    errors.name = "নাম দিন।";
  } else if (name.trim().length < 3) {
    errors.name = "নাম কমপক্ষে ৩ অক্ষরের হতে হবে।";
  }

  // date of birth check
  if (!dob || dob.trim() === "") {
    errors.dob = "জন্মতারিখ নির্বাচন করুন।";
  }

  // email check
  if (!email || email.trim() === "") {
    errors.email = "ইমেইল দিন।";
  } else if (!isValidEmail(email.trim())) {
    errors.email = "সঠিক ইমেইল দিন।";
  }

  // password check
  if (!password || password.trim() === "") {
    errors.password = "পাসওয়ার্ড দিন।";
  } else if (password.length < 6) {
    errors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  }

  // role check
  const allowedRoles = ["candidate", "voter", "public"];
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
//   module.exports = { validateRegistrationInput };
// }
