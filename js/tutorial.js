/**
 * Returns a sample HTML block.
 * @returns {string} Sample HTML for testing JSDoc rendering
 */
function getSample() {
  return `
    <h1>Hello from JSDoc</h1>
    <p>This content is coming from JavaScript using JSDoc.</p>
  `;
}

/**
 * Renders the sample block into the #app div.
 * @returns {void}
 */
function renderSample() {
  const app = document.getElementById("app");
  app.innerHTML = getSample();
}

document.addEventListener("DOMContentLoaded", renderSample);
