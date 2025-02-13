// Patch to ignore ResizeObserver loop limit exceeded errors
window.addEventListener("error", (event) => {
  if (event.message === "ResizeObserver loop limit exceeded") {
    event.stopImmediatePropagation();
    // Optionally log or ignore the error silently.
    return false;
  }
});
