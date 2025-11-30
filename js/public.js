/**
 * Generates the Public Profiles page content.
 *
 * @returns {string} HTML string for the public profiles section
 */
function getPublicProfilesPage() {
  return `
    <h1>CampusCast Public Profiles</h1>
    <p>এটা একটি টেস্ট। এটি দেখায় যে JS সঠিকভাবে HTML লিখতে পারছে।</p>
  `;
}

/**
 * Injects the public profiles content into the main container.
 *
 * @returns {void}
 */
function renderPublicProfilesPage() {
  const container = document.getElementById("app");
  container.innerHTML = getPublicProfilesPage();
}

document.addEventListener("DOMContentLoaded", renderPublicProfilesPage);
