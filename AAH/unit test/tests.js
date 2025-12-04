/**
 * @fileoverview Simple browser unit tests for CampusCast helpers.
 * Uses minimal test runner with JSDoc comments.
 */

/**
 * @typedef {Object} TestResult
 * @property {string} name
 * @property {boolean} passed
 * @property {string} [error]
 */

/** @type {TestResult[]} */
const results = [];

/**
 * Register and run a test.
 * @param {string} name
 * @param {() => void} fn
 */
function test(name, fn) {
  try {
    fn();
    console.log("✅ PASS - " + name);
    results.push({ name, passed: true });
  } catch (err) {
    console.error("❌ FAIL - " + name, err);
    results.push({ name, passed: false, error: String(err) });
  }
}

/**
 * Assert that two values are strictly equal.
 * @param {any} actual
 * @param {any} expected
 * @param {string} [msg]
 */
function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(
      (msg || "Values are not equal") +
        " | expected=" +
        JSON.stringify(expected) +
        " actual=" +
        JSON.stringify(actual)
    );
  }
}

/**
 * Assert that a value is null.
 * @param {any} value
 * @param {string} [msg]
 */
function assertNull(value, msg) {
  if (value !== null) {
    throw new Error((msg || "Value is not null") + " | actual=" + JSON.stringify(value));
  }
}

/**
 * Render results in the page.
 */
function renderResults() {
  const out = document.getElementById("testOutput");
  if (!out) {
    return;
  }

  let text = "";
  let passedCount = 0;
  let failedCount = 0;

  results.forEach(r => {
    if (r.passed) {
      passedCount += 1;
      text += "✅ PASS - " + r.name + "\n";
    } else {
      failedCount += 1;
      text += "❌ FAIL - " + r.name + "\n    " + r.error + "\n";
    }
  });

  text =
    "Total: " + results.length +
    ", Passed: " + passedCount +
    ", Failed: " + failedCount +
    "\n\n" +
    text;

  out.textContent = text;
}

/* ---------------- Tests for shortStatus ---------------- */

/** @test */
test("shortStatus maps active to চলমান", () => {
  const actual = shortStatus("active");
  assertEqual(actual, "চলমান", "active should map to চলমান");
});

/** @test */
test("shortStatus maps closed to সমাপ্ত", () => {
  const actual = shortStatus("closed");
  assertEqual(actual, "সমাপ্ত", "closed should map to সমাপ্ত");
});

/** @test */
test("shortStatus returns অজানা for falsy values", () => {
  assertEqual(shortStatus(""), "অজানা");
  assertEqual(shortStatus(null), "অজানা");
  assertEqual(shortStatus(undefined), "অজানা");
});

/** @test */
test("shortStatus returns original string for unknown status", () => {
  assertEqual(shortStatus("pending"), "pending");
});

/* ---------------- Tests for badgeColor ---------------- */

/** @test */
test("badgeColor for active", () => {
  assertEqual(badgeColor("active"), "#dcfce7");
});

/** @test */
test("badgeColor for closed", () => {
  assertEqual(badgeColor("closed"), "#fee2e2");
});

/** @test */
test("badgeColor default for other values", () => {
  assertEqual(badgeColor("pending"), "#e5e7eb");
  assertEqual(badgeColor(""), "#e5e7eb");
});

/* ---------------- Tests for getCurrentUser ---------------- */

/** @test */
test("getCurrentUser returns null when nothing saved", () => {
  localStorage.removeItem(CC_CURRENT_USER_KEY);
  const user = getCurrentUser();
  assertNull(user, "User should be null when not in storage");
});

/** @test */
test("getCurrentUser returns parsed object for valid JSON", () => {
  const mockUser = { id: "123", role: "voter", name: "Test Voter" };
  localStorage.setItem(CC_CURRENT_USER_KEY, JSON.stringify(mockUser));
  const user = getCurrentUser();
  assertEqual(user.id, mockUser.id);
  assertEqual(user.role, mockUser.role);
  assertEqual(user.name, mockUser.name);
});

/** @test */
test("getCurrentUser returns null for invalid JSON", () => {
  localStorage.setItem(CC_CURRENT_USER_KEY, "{invalid-json");
  const user = getCurrentUser();
  assertNull(user, "User should be null for invalid JSON");
});

/* ---------------- Tests for requireVoter (happy path) ---------------- */

/** @test */
test("requireVoter returns user when role is voter", () => {
  const mockUser = { id: "999", role: "voter", name: "Valid Voter" };
  localStorage.setItem(CC_CURRENT_USER_KEY, JSON.stringify(mockUser));

  // Stop real navigation during this test
  const originalLocation = window.location;
  const fakeLocation = { href: "about:blank" };
  Object.defineProperty(window, "location", {
    value: fakeLocation,
    writable: true
  });

  const user = requireVoter();
  assertEqual(user.id, "999");
  assertEqual(user.role, "voter");

  // Restore location
  Object.defineProperty(window, "location", {
    value: originalLocation,
    writable: true
  });
});

/* ---------------- Run after load ---------------- */

window.addEventListener("load", renderResults);
