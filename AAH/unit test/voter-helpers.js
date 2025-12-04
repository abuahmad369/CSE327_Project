/**
 * @fileoverview Helper functions for CampusCast voter dashboard.
 */

/**
 * Storage key for current user in localStorage.
 * @type {string}
 */
const CC_CURRENT_USER_KEY = "cc_currentUser";

/**
 * @typedef {Object} CurrentUser
 * @property {string} id
 * @property {string} role
 * @property {string} [name]
 */

/**
 * Get the current user object from localStorage.
 * @returns {CurrentUser|null}
 */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CC_CURRENT_USER_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Ensure the current user is a voter.
 * Redirects to login page if not valid.
 * @returns {CurrentUser|null}
 */
function requireVoter() {
  const user = getCurrentUser();
  if (!user || user.role !== "voter") {
    window.location.href = "/login/login.html";
    return null;
  }
  return user;
}

/**
 * Convert election status to a short Bangla label.
 * @param {string|null|undefined} status
 * @returns {string}
 */
function shortStatus(status) {
  if (!status) {
    return "অজানা";
  }
  if (status === "active") {
    return "চলমান";
  }
  if (status === "closed") {
    return "সমাপ্ত";
  }
  return status;
}

/**
 * Return badge background color based on status.
 * @param {string|null|undefined} status
 * @returns {string}
 */
function badgeColor(status) {
  if (status === "active") {
    return "#dcfce7";
  }
  if (status === "closed") {
    return "#fee2e2";
  }
  return "#e5e7eb";
}
